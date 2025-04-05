import CreateShopForm from "@/features/shop/components/CreateShopForm";
import styles from "@/app/page.module.css";

export default function CreateShopPage() {
  return (
    <div className="container flex flex-col items-center justify-center mx-auto py-6">
      <h1 className={styles.subtitle}>매장 등록</h1>
      <CreateShopForm />
    </div>
  );
}