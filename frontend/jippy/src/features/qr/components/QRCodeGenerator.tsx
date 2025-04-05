"use client";

import React, { useState, useEffect } from "react";
import { Printer, QrCode, Loader2, Plus } from "lucide-react";
import { Button } from "@/features/common/components/ui/button";
import { Card, CardContent } from "@/features/common/components/ui/card/Card";
import { QR_PAGES } from "@/features/qr/constants/pages";
import { QRConfig, QRData } from "../types/qr";
import Image from "next/image";

const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

const QR_CONFIGS: QRConfig[] = [
  {
    name: "피드백",
    explain: "FEEDBACKQR",
    url: "https://jippy.duckdns.org/svt/customer/feedback/{storeId}",
  },
  {
    name: "직원 등록",
    explain: "USERQR",
    url: "https://jippy.duckdns.org/signup/staff/{storeId}",
  }
];

const QRCodeCRUD: React.FC = () => {
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrImageBase64, setQrImageBase64] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 200,
    height: 200,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [qrExists, setQrExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrList, setQrList] = useState<QRData[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const encodedStoreIdList = getCookieValue("storeIdList");
      if (!encodedStoreIdList) {
        setError("다시 로그인해주세요");
        return;
      }

      const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
      const storeIdList = JSON.parse(decodedStoreIdList);

      if (!storeIdList || storeIdList.length === 0) {
        setError("매장 정보를 찾을 수 없습니다");
        return;
      }

      setStoreId(storeIdList[0]);

      const token = getCookieValue("accessToken");
      setAccessToken(token);
    } catch (error) {
      console.log(error);
      setError("쿠키 처리 중 오류가 발생했습니다");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (qrImage) {
        URL.revokeObjectURL(qrImage);
      }
    };
  }, [qrImage]);

  const fetchQRList = async () => {
    if (!storeId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/qr/${storeId}/select`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("QR 코드 목록 조회 실패");
      }

      const result = await response.json();
      const data = result.data || [];

      setQrList(data);
    } catch (error) {
      console.error("QR 코드 목록 조회 실패:", error);
      setQrList([]);
    }
  };

  useEffect(() => {
    fetchQRList();
  }, [storeId, accessToken]);

  useEffect(() => {
    if (qrImage) {
      const tempImg = document.createElement("img");
      tempImg.src = qrImage;
      tempImg.onload = () => {
        setImageDimensions({
          width: tempImg.naturalWidth,
          height: tempImg.naturalHeight,
        });
      };
    }
  }, [qrImage]);

  const checkQRExists = async (qrName: string) => {
    if (!storeId) {
      setError("매장 정보가 없습니다.");
      return false;
    }

    setQrImage(null);
    setQrImageBase64(null);
    setImageDimensions({ width: 200, height: 200 });

    const qrConfig = QR_CONFIGS.find((config) => config.name === qrName);

    if (!qrConfig) {
      setQrExists(false);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const existingQR = qrList.find(
        (qr) => qr?.explain?.toUpperCase() === qrConfig.explain.toUpperCase()
      );

      if (existingQR) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/qr/${storeId}/select/${existingQR.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const qrInfo = await response.json();

          if (qrInfo.success && qrInfo.data) {
            const formattedUrl = qrConfig.url.replace(
              "{storeId}",
              storeId.toString()
            );
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
              formattedUrl
            )}&size=200x200`;

            const response = await fetch(qrImageUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              setQrImageBase64(reader.result as string);
            };

            setQrImage(qrImageUrl);
            setQrExists(true);
          } else {
            throw new Error("QR 코드 정보가 올바르지 않습니다");
          }

          return true;
        } else {
          throw new Error(`status : ${response.status}`);
        }
      } else {
        setQrExists(false);
        setQrImage(null);
        setQrImageBase64(null);
        return false;
      }
    } catch (error) {
      setError("QR CODE를 조회하는데 실패했습니다.");
      setQrExists(false);
      setQrImage(null);
      setQrImageBase64(null);

      if (process.env.NODE_ENV === "development") {
        console.error("QR CODE 로딩 실패: ", error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRGenerate = async (qrName: string) => {
    if (!storeId) {
      alert("매장 정보가 없습니다.");
      return;
    }

    const qrConfig = QR_CONFIGS.find((config) => config.name === qrName);

    if (!qrConfig) return;

    try {
      setIsLoading(true);
      setError(null);

      const existingQR = qrList.find(
        (qr) => qr?.explain?.toLowerCase() === qrConfig.explain.toLowerCase()
      );

      if (existingQR) {
        alert("이미 해당 메뉴의 QR 코드가 존재합니다.");
        await checkQRExists(qrName);
        return;
      }

      const formattedUrl = qrConfig.url.replace(
        "{storeId}",
        storeId.toString()
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/qr/${storeId}/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            explain: qrConfig.explain,
            url: formattedUrl,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("QR 코드 생성에 실패했습니다");
      }

      await fetchQRList();
      await checkQRExists(qrName);
    } catch (error) {
      console.error("QR 코드 생성 오류:", error);
      setError("QR 코드 생성에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRButtonClick = async (qrName: string) => {
    setSelectedQR(qrName);
    setError(null);
    await checkQRExists(qrName);
  };

  const handlePrint = () => {
    if (!qrImageBase64) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("팝업이 차단되었습니다 팝업 차단을 해제해 주세요");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedQR} QR 코드</title>
          <style>
            body { 
              text-align: center; 
              padding: 40px 20px;
              margin: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #f8fafc;
              font-family: 'Noto Sans KR', sans-serif;
            }
            .container {
              background: white;
              padding: 48px;
              border-radius: 16px;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
              max-width: 400px;
              width: 100%;
            }
            .header {
              margin-bottom: 32px;
              padding-top: 16px;
            }
            .title {
              font-size: 24px;
              font-weight: 700;
              color: #1e293b;
              margin: 0 0 8px 0;
            }
            .subtitle {
              font-size: 14px;
              color: #64748b;
              margin: 0;
            }
            .qr-container {
              background: white;
              padding: 24px;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              margin: 24px 0;
            }
            img { 
              width: 280px; 
              height: 280px;
              object-fit: contain;
            }
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .container {
                box-shadow: none;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">${selectedQR} QR 코드</h1>
            </div>
            <div class="qr-container">
              <img src="${qrImageBase64}" alt="QR Code" />
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow?.document.close();
  };

  return (
    <div className="flex justify-center items-center p-8">
      <Card className="w-full max-w-4xl bg-white">
        <CardContent className="p-6">
          <div className="flex gap-8 items-center min-h-[600px]">
            <div className="flex flex-col gap-3 shrink-0">
              {QR_PAGES.map((config) => (
                <Button
                key={config.name}
                onClick={() => handleQRButtonClick(config.name)}
                variant={selectedQR === config.name ? "default" : "default"}
                className={`w-32 md:w-40 lg:w-48 justify-start h-11 bg-white border-2 ${
                  selectedQR === config.name
                    ? "border-orange-500 text-orange-500 hover:bg-orange-50"
                    : "border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-500"
                }`}
              >
                <QrCode className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{config.name}</span>
              </Button>
              ))}
            </div>

            <div className="flex-1 flex justify-center">
              <div className="w-[320px]">
                <div className="flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      {selectedQR ? `${selectedQR} QR 코드` : "QR 코드"}
                    </h3>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6 w-full h-[320px] flex items-center justify-center">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin opacity-70 mb-4" />
                          <p className="text-sm text-gray-500">
                            QR 코드 {qrExists ? "생성" : "조회"} 중...
                          </p>
                        </div>
                      ) : error ? (
                        <div className="flex flex-col items-center justify-center text-red-500">
                          <p className="text-sm text-center">{error}</p>
                        </div>
                      ) : selectedQR && qrExists === false ? (
                        <div className="flex flex-col items-center justify-center">
                          <Button
                            onClick={() => handleQRGenerate(selectedQR)}
                            className="bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {selectedQR} QR 코드 생성하기
                          </Button>
                        </div>
                      ) : qrImage && imageDimensions.width > 0 ? (
                        <Image
                          src={qrImage}
                          alt="QR Code"
                          width={200}
                          height={200}
                          className="object-contain"
                          onError={() => {
                            setError("QR 코드 이미지를 불러올 수 없습니다");
                            setQrImage(null);
                          }}
                          unoptimized
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <QrCode className="w-16 h-16 mb-4 opacity-40" />
                          <p className="text-sm">
                            QR 코드를 생성하려면 버튼을 클릭하세요
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handlePrint}
                      disabled={!qrImage || !!error}
                      className={`w-full h-11 ${
                        !qrImage || !!error
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-orange-500 text-white hover:bg-orange-600"
                      }`}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      QR 코드 출력하기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeCRUD;