<script>
  import { goto } from "$app/navigation";
  import "../../../../app.css";

  // function goBack() {
  //   goto("/");
  // }
</script>

<div class="flex justify-center items-center min-h-screen bg-gray-100">
  <div
    class="bg-white w-full max-w-md sm:max-w-lg md:max-w-xl min-h-screen flex flex-col justify-center items-center px-8 py-12 shadow-lg"
  >
    <!-- 상단 영역 (제목) -->
    <div class="flex-none self-start w-full">
      <h2 class="text-2xl font-bold mb-6">고객 의견</h2>
    </div>

    <!-- 완료 메시지 -->
    <div class="flex-grow flex flex-col items-center justify-center">
      <!-- 아이콘 -->
      <div
        class="w-16 h-16 flex items-center justify-center rounded-full bg-[#FF5C00]"
      >
        <svg
          class="w-10 h-10 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <p class="text-lg font-semibold mt-6">불편 사항이 잘 전달되었어요!</p>
      <p class="text-xl font-bold text-[#FF5C00] mt-2">감사합니다!</p>
    </div>

    <!-- 버튼 -->
    <!-- <div class="flex-none mt-8 w-full">
      <button
        on:click={goBack}
        class="w-full bg-[#FF5C00] text-white py-4 rounded-lg hover:bg-[#E65200] transition-all text-lg font-bold"
      >
        확인
      </button>
    </div> -->
  </div>
</div>
