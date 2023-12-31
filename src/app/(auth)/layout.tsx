export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <main
        className="
          h-screen
          flex 
          items-center
          p-4
          justify-center"
      >
        {children}
      </main>
    );
  }
  