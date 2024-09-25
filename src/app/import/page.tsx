import CSVUpload from "@/components/CSVUpload";

const Import = async () => {

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          <h1>Import Recipes</h1>
          <CSVUpload />

          <a href="/">
            Return Home
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        Myles Pritchett
      </footer>
    </div>
  );
}

export default Import;
