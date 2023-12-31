import { Sidebar, SidebarSkeleton } from "@/src/components/side/sidebar";
import React, { Suspense } from "react";
import { Container } from "@/src/components/side/container";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    workspaceId: string;
  };
}

const WorkspaceLayout: React.FC<LayoutProps> = ({ children, params }) => {
  return (
    <main
      className="flex overflow-hidden
    h-screen
    w-screen
"
    >
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar workspaceId={params.workspaceId} />
      </Suspense>

      <Container>{children}</Container>
    </main>
  );
};

export default WorkspaceLayout;
