import Image from "next/image";
import Link from "next/link";
import React from "react";
import Logo from "@/public/cypresslogo.svg";
import { ModeToggle } from "@/src/components/mode-toggle";
import { UserButton } from "../user/user-button";

export const Navbar = () => {
  return (
    <header
      className="p-4
      flex
      justify-between
      items-center
  "
    >
      <Link href={"/"} className="flex gap-2 items-center">
        <Image src={Logo} alt="Logo" width={25} height={25} />
        <span
          className="font-semibold
          dark:text-white
        "
        >
          Ocean.
        </span>
      </Link>

      <div className="flex items-center gap-2 mr-4">
        <ModeToggle />
       
      <UserButton/>
      
      </div>
    </header>
  );
};
