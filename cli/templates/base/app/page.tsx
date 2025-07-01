export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#171717] text-white p-8">
      <div className="flex flex-col items-center justify-center space-y-8">
        <h1 className="text-5xl font-semibold text-gray-100 tracking-wide">
          PulseNext
        </h1>
        <div className="space-y-4 text-center max-w-2xl">
          <p className="text-lg text-gray-300">
            1. Get started by running{" "}
            <code className="text-gray-400 bg-[#1a1a1a] px-3 py-2 rounded-md shadow-md hover:bg-[#2a2a2a] transition duration-300">
              pulsenext create &lt;project-name&gt;
            </code>
          </p>
          <p className="text-lg text-gray-300">
            2. Start building with the perfect stack for your next project.
          </p>
          <p className="text-lg text-gray-300">
            3. Edit this file in{" "}
            <span className="font-semibold">app/page.tsx</span> to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
