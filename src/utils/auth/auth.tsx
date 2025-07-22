import { useRouter } from "next/router";
import { useEffect } from "react";

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Wrapper: React.FC<P> = (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
