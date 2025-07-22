import type { AppProps, AppContext } from "next/app";
import App from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";
import { SessionProvider, getSession } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import store from "@/store/store";
import "../styles/globals.css";
import AskAIModal from "@/components/aiModal";
import { useEffect } from "react";
import useVersionCheck from "../../src/hooks/useVersionCheck";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UploadModal } from "@/components/Modals/Project";
// import { SimiliarTables } from "@/components/Modals/SimiliarTables";
import { initializeAmplitude } from '@/lib/amplitude/amplitude';
import { SocketProvider } from "@/context/SocketContext";


function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const isUpdateAvailable = useVersionCheck();

  useEffect(() => {
    if (isUpdateAvailable) {
      const confirmUpdate = window.confirm(
        "A new version is available. Click OK to update the application.",
      );
      if (confirmUpdate) {
        window.location.reload();
      }
    }
  }, [isUpdateAvailable]);
  useEffect(() => {
    if (session?.user?.id) {
      initializeAmplitude(session.user.id);
    }
  }, [session]);
  

  return (
      <SessionProvider session={session}>
        <ReduxProvider store={store}>
          <SocketProvider>
            <Component {...pageProps} />
            <UploadModal />
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            {/* <SimiliarTables /> */}
            <AskAIModal />
          </SocketProvider>
        </ReduxProvider>
      </SessionProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const { ctx } = appContext;
  let session = null;

  try {
    session = await getSession(ctx);
  } catch (error) {
    console.error("Error getting session in _app.tsx:", error);
  }

  const appProps = await App.getInitialProps(appContext);

  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      session,
    },
  };
};

export default MyApp;