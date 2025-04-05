"use client";

import { useState } from "react";
import { Shop } from "@/features/shop/types/shops";
import { Modal } from "@/features/common/components/ui/modal/Modal";
import { UpdateShopForm } from "./UpdateShopForm";
import styles from "../styles/ShopDetailModal.module.css";

interface ShopDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  onUpdate: (shop: Shop) => void;
  onDelete: (id: number) => void;
  accessToken: string | null;
}

export default function ShopDetailModal({ 
  shop, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  accessToken
}: ShopDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!shop) return null;

  const handleUpdateSuccess = (updatedShop: Shop) => { 
    try {
      setError(null);
      setIsEditing(false); 
      onUpdate(updatedShop);
    } catch {  // err를 _로 변경
      setError("업데이트 처리 중 오류가 발생했습니다.");
    }
  };
  
  const handleDelete = () => {
    try {
      if (!accessToken) {
        setError("인증 정보가 없습니다. 다시 로그인해주세요.");
        return;
      }
      onDelete(shop.id);
    } catch {
      setError("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    if (!accessToken) {
      setError("인증 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    setError(null);
    setIsEditing(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{shop.name}</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isEditing ? (
          <UpdateShopForm
            shop={shop}
            onClose={() => {
              setError(null);
              setIsEditing(false);
            }}
            onSuccess={handleUpdateSuccess}
            accessToken={accessToken}
          />
        ) : (
          <>
            <div className={styles.content}>
              <div>
                <h3 className={styles.sectionTitle}>기본 정보</h3>
                <div className={styles.section}>
                  <p><span className={styles.label}>주소:</span> {shop.address}</p>
                  <p>
                    <span className={styles.label}>사업자등록번호:</span>
                    <br />{shop.businessRegistrationNumber}
                  </p>
                  <p>
                    <span className={styles.label}>개업일:</span>
                    <br />{new Date(shop.openingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className={styles.sectionTitle}>재무 정보</h3>
                <div className={styles.section}>
                  <p>
                    <span className={styles.label}>보유 현금:</span>
                    <br />{shop.totalCash.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className={styles.footer}>
          <div className="grid grid-cols-3 gap-2 w-full">
            {!isEditing && (
              <>
              <button 
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full col-span-1"
              >
                수정
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full col-span-1"
              >
                삭제
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full col-span-1">
                닫기
              </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}