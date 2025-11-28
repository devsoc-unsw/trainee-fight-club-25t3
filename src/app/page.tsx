import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-20 px-20 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-center">
          <h1 className="max-w-w text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Zanki - Fight Club (25T3 Training Program)
          </h1>
        </div>
      </main>
    </div>
  );
}
