import { getActiveProductsWithPrice } from "@/src/lib/supabase/queries";
import { SubscriptionModalProvider } from "@/src/provider/subscription-modal-provider";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<LayoutProps> = async ({ children }) => {
  const { data: products, error } = await getActiveProductsWithPrice();
  if (error) throw new Error();

  return (
    <main className="flex over-hidden h-screen">
      <SubscriptionModalProvider products={products}>
        {children}
      </SubscriptionModalProvider>
    </main>
  );
};

export default DashboardLayout;