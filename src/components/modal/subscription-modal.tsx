"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";;
import { PriceType, ProductWirhPrice } from "@/src/lib/supabase/types";
import { formatPrice, postData } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { useUser } from "@/src/provider/use-user";
import { Loader } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { getStripe } from "@/src/lib/stripe/stripeClient";
import { useSubscriptionModal } from "@/src/provider/subscription-modal-provider";

interface SubscriptionModalProps {
  products: ProductWirhPrice[];
}

export const SubscriptionModal = ({ products }: SubscriptionModalProps) => {
  const { open, setOpen } = useSubscriptionModal();
  const { subscription, user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onClickContinue = async (price: PriceType) => {
    try {
      setIsLoading(true);
      if (!user) {
        toast({ title: "You must be logged in" });
        setIsLoading(false);
        return;
      }
      if (subscription) {
        toast({ title: "Already on a paid plan" });
        setIsLoading(false);
        return;
      }
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });

      console.log("Getting Checkout for stripe");
        const stripe = await getStripe();
        stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({ title: "Oppse! Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog    open={open}
    onOpenChange={setOpen}>
      {subscription?.status === "active" ? (
        <DialogContent>Already on a paid plan!</DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to a Pro Plan</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            To access Pro features you need to have a paid plan.
          </DialogDescription>


          {products.length
            ? products.map((product) => (
                <div
                  className="
                  flex
                  justify-between
                  items-center
                  "
                  key={product.id}
                >
                  {product.prices?.map((price) => (
                    <React.Fragment key={price.id}>
                      <b className="text-3xl text-foreground">
                        {formatPrice(price)} / <small>{price.interval}</small>
                      </b>
                      <Button
                        onClick={() => onClickContinue(price)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader className="animate-spin" /> : "Upgrade ✨"}
                      </Button>
                    </React.Fragment>
                  ))}
                </div>
              ))
            : ""}
        </DialogContent>
      )}
    </Dialog>
  );
};
