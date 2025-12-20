"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Upload, Bot, User, ReceiptText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import SignOutButton from "@/components/ui/sign-out";
import TestApiButton from "@/components/ui/database-button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} className="border-r-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight text-primary"
          >
            Zanki
          </Link>
          <ModeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <Home className="mr-2" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/entry">
                <Upload className="mr-2" />
                <span>Upload Data</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/view">
                <ReceiptText className="mr-2" />
                <span>View Data</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/chatbot">
                <Bot className="mr-2" />
                <span>AI Chatbot</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* <SidebarMenuItem className="mt-2">
                 <TestApiButton />
            </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </div>
          <SignOutButton />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
