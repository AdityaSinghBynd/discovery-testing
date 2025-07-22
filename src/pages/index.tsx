import Head from "next/head";
import dynamic from "next/dynamic";

const HomeLayout = dynamic(() => import("@/components/HomeLayout"), {
  ssr: false,
});

const Index = () => {
  return (
    <>
      <Head>
        <title>Bynd</title>
        <meta name="description" content="Bynd fin-tech platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/ByndLogoFavicon.svg" />
      </Head>
      <div className="min-h-screen min-w-full flex flex-col">
        <HomeLayout />
      </div>
    </>
  );
};

export default Index;
