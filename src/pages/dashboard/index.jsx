import { A, Link } from "@solidjs/router";
import { createSignal } from "solid-js";
function Dashboard() {
  const [message] = createSignal("We are building something great!");

  return (
    <div class="flex h-screen bg-gray-100">
      {/* Image Section */}
      <div class="w-1/2 p-8 flex items-center">
        <img
          src="/src/assets/p3.png"
          alt="Placeholder Image"
          class="w-full h-auto rounded-lg"
        />
      </div>

      {/* Text and Button Section */}
      <div class="w-1/2 p-8 flex flex-col justify-center">
        <h1 class="text-3xl font-semibold mb-4">BIMER</h1>
        <p class="text-gray-600 text-lg mb-8">{message()}</p>
        <Link
          class="bg-blue-500 text-white  text-center px-4 py-2 rounded-md hover:bg-blue-600"
          href="/146345"
        >
          Demo
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
