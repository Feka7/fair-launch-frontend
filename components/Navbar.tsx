"use client";
import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  return (
    <>
      <div className="navbar max-w-7xl mx-auto bg-secondary text-secondary-content rounded-lg mt-2">
        <div className="navbar-start">Fair launch</div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link href="/explore">Explore</Link>
            </li>
            <li>
              <Link href="/new-campaign">Create</Link>
            </li>
            <li>
              <Link href="#">Manage</Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end space-x-3">
          <ThemeSwitcher />
          <ConnectKitButton />
        </div>
      </div>
      <div className="flex justify-center lg:hidden">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="#">Explore</Link>
          </li>
          <li>
            <Link href="#">Create</Link>
          </li>
          <li>
            <Link href="#">Manage</Link>
          </li>
        </ul>
      </div>
    </>
  );
}
