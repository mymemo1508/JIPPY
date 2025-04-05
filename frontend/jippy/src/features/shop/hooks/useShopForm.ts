import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { createShop } from "@/redux/slices/shopSlice";
import type {
  FormData,
  FormErrors,
  OCRResponse,
} from "@/features/shop/types/shops";
import type { RootState, AppDispatch } from "@/redux/store";

export const useShopForm = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.shop);
  
  // 상태 초기화
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    openingDate: "",
    businessRegistrationNumber: "",
    representativeName: "",
    latitude: "",
    longitude: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // 쿠키에서 특정 값을 가져오는 함수
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const cookieValue = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.split("=")[1];
    return cookieValue || null;
  };

  // 쿠키 값 설정 useEffect
  useEffect(() => {
    const token = getCookie("accessToken");
    const userIdString = getCookie("userId");

    setAccessToken(token);
    setUserId(userIdString ? Number(userIdString) : null);
  }, []);

  // 현재 위치 가져오기 (쿠키 값이 설정된 후 실행)
  useEffect(() => {
    if (!userId || !accessToken) return; // 쿠키 값이 없으면 실행하지 않음

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
        },
        (error) => {
          console.error("위치 정보를 가져오는 데 실패했습니다.", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
    }
  }, [userId, accessToken]); // userId와 accessToken이 설정된 후 실행됨

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "매장 이름은 필수입니다.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "주소는 필수입니다.";
    }

    const businessNumberPattern = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberPattern.test(formData.businessRegistrationNumber)) {
      newErrors.businessRegistrationNumber =
        "올바른 사업자등록번호 형식이 아닙니다.";
    }

    if (!formData.representativeName.trim()) {
      newErrors.representativeName = "대표자명은 필수입니다.";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "businessRegistrationNumber") {
      const formattedValue = value
        .replace(/[^\d]/g, "")
        .replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !accessToken) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (!validateForm()) return;

    try {
      await dispatch(
        createShop({
          ...formData,
          userOwnerId: userId,
        })
      ).unwrap();

      alert("매장이 성공적으로 등록되었습니다");
      router.push("/shop");
    } catch (error) {
      alert(error);
    }
  };

  const handleOCRSuccess = (ocrResponse: OCRResponse) => {
    const { data } = ocrResponse;
    const formattedBusinessNumber = data.businessNumber.replace(
      /(\d{3})(\d{2})(\d{5})/,
      "$1-$2-$3"
    );
    const formattedDate = data.openDate.split(" ")[0];

    setFormData((prev) => ({
      ...prev,
      name: data.corporateName,
      businessRegistrationNumber: formattedBusinessNumber,
      openingDate: formattedDate,
      representativeName: data.representativeName,
    }));
  };

  return {
    formData,
    errors: formErrors,
    isLoading,
    error,
    isProcessingImage,
    setIsProcessingImage,
    handleChange,
    handleSubmit,
    handleOCRSuccess,
  };
};
