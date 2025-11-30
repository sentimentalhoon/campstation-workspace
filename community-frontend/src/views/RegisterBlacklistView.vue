<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  Camera,
  X,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Building2,
  AlertTriangle,
  FileText,
} from "lucide-vue-next";

const router = useRouter();

// Form data
const formData = ref({
  name: "",
  age: "",
  gender: "남성",
  phone: "",
  region: "",
  pcCafe: "",
  dangerLevel: "경고",
  reason: "",
  description: "",
  images: [],
});

const regions = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

const dangerLevels = [
  { value: "위험", color: "bg-red-500", description: "심각한 기물 파손, 폭력, 범죄 행위" },
  { value: "경고", color: "bg-orange-500", description: "반복적인 문제 행동, 규칙 위반" },
  { value: "주의", color: "bg-yellow-500", description: "가벼운 규칙 위반, 주의 필요" },
];

const commonReasons = [
  "기물 파손",
  "음식물 쓰레기 방치",
  "흡연 및 욕설",
  "음란물 시청",
  "요금 미납",
  "소음 및 난동",
  "기타",
];

// Validation
const errors = ref({});

const validateForm = () => {
  const newErrors = {};

  if (!formData.value.name.trim()) {
    newErrors.name = "이름을 입력해주세요 (익명 처리됩니다)";
  }

  if (!formData.value.age || formData.value.age < 19) {
    newErrors.age = "성인(만 19세 이상) 정보만 등록 가능합니다";
  }

  if (!formData.value.phone.trim()) {
    newErrors.phone = "연락처를 입력해주세요 (일부 가려집니다)";
  } else if (!/^010-\d{4}-\d{4}$/.test(formData.value.phone)) {
    newErrors.phone = "올바른 형식으로 입력해주세요 (010-0000-0000)";
  }

  if (!formData.value.region) {
    newErrors.region = "지역을 선택해주세요";
  }

  if (!formData.value.pcCafe.trim()) {
    newErrors.pcCafe = "PC방 이름을 입력해주세요";
  }

  if (!formData.value.reason.trim()) {
    newErrors.reason = "사유를 선택하거나 입력해주세요";
  }

  if (!formData.value.description.trim()) {
    newErrors.description = "상세 내용을 입력해주세요 (최소 20자 이상)";
  } else if (formData.value.description.trim().length < 20) {
    newErrors.description = "상세 내용을 최소 20자 이상 입력해주세요";
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const formatPhoneNumber = () => {
  let value = formData.value.phone.replace(/[^0-9]/g, "");
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 6) {
    formData.value.phone = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
  } else if (value.length > 3) {
    formData.value.phone = `${value.slice(0, 3)}-${value.slice(3)}`;
  } else {
    formData.value.phone = value;
  }
};

const selectReason = (reason) => {
  formData.value.reason = reason;
  errors.value.reason = "";
};

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  const maxImages = 5;

  if (formData.value.images.length + files.length > maxImages) {
    alert(`최대 ${maxImages}개의 이미지만 업로드 가능합니다`);
    return;
  }

  files.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 파일은 5MB 이하만 업로드 가능합니다");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      formData.value.images.push({
        id: Date.now() + Math.random(),
        url: e.target.result,
        file,
      });
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (id) => {
  formData.value.images = formData.value.images.filter((img) => img.id !== id);
};

const handleSubmit = () => {
  if (!validateForm()) {
    const firstError = Object.values(errors.value)[0];
    alert(firstError);
    return;
  }

  // TODO: API 호출로 데이터 전송
  console.log("Form submitted:", formData.value);
  alert("블랙리스트 등록이 완료되었습니다.\n관리자 검토 후 게시됩니다.");
  router.push("/");
};

const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.age >= 19 &&
    formData.value.phone &&
    formData.value.region &&
    formData.value.pcCafe &&
    formData.value.reason &&
    formData.value.description.length >= 20
  );
});
</script>

<template>
  <div class="min-h-screen bg-black pb-20">
    <!-- Header -->
    <div class="sticky top-0 z-50 bg-black border-b border-gray-800 px-4 py-3">
      <div class="flex items-center justify-between">
        <button @click="router.back()" class="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft :size="24" />
        </button>
        <h1 class="text-lg font-bold text-white">블랙리스트 등록</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <!-- Warning Notice -->
    <div class="m-4 p-4 bg-orange-900/20 border border-orange-500/30 rounded-xl">
      <div class="flex items-start space-x-3">
        <AlertCircle :size="20" class="text-orange-500 mt-0.5 flex-shrink-0" />
        <div class="text-sm text-orange-200">
          <p class="font-bold mb-1">허위 정보 등록 시 법적 책임이 있습니다</p>
          <p class="text-xs text-orange-300">
            개인정보는 일부 가려져 표시되며, 관리자 검토 후 게시됩니다.
          </p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="p-4 space-y-6">
      <!-- Basic Info Section -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 class="text-white font-bold mb-4 flex items-center">
          <User :size="18" class="mr-2" />
          기본 정보
        </h2>

        <!-- Name -->
        <div class="mb-4">
          <label class="block text-sm text-gray-400 mb-2">
            이름 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="실명 입력 (자동으로 일부 가려짐)"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
            :class="{ 'border-red-500/50': errors.name }"
          />
          <p v-if="errors.name" class="text-xs text-red-400 mt-1">{{ errors.name }}</p>
        </div>

        <!-- Age & Gender -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label class="block text-sm text-gray-400 mb-2">
              나이 <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="formData.age"
              type="number"
              min="19"
              placeholder="만 19세 이상"
              class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
              :class="{ 'border-red-500/50': errors.age }"
            />
            <p v-if="errors.age" class="text-xs text-red-400 mt-1">{{ errors.age }}</p>
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-2">
              성별 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.gender"
              class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500/50"
            >
              <option value="남성">남성</option>
              <option value="여성">여성</option>
            </select>
          </div>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">
            연락처 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.phone"
            @input="formatPhoneNumber"
            type="tel"
            placeholder="010-0000-0000"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
            :class="{ 'border-red-500/50': errors.phone }"
          />
          <p v-if="errors.phone" class="text-xs text-red-400 mt-1">{{ errors.phone }}</p>
          <p class="text-xs text-gray-500 mt-1">중간 4자리는 자동으로 가려집니다</p>
        </div>
      </div>

      <!-- Location Info Section -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 class="text-white font-bold mb-4 flex items-center">
          <MapPin :size="18" class="mr-2" />
          발생 장소
        </h2>

        <!-- Region -->
        <div class="mb-4">
          <label class="block text-sm text-gray-400 mb-2">
            지역 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.region"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500/50"
            :class="{ 'border-red-500/50': errors.region }"
          >
            <option value="" disabled>지역 선택</option>
            <option v-for="region in regions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
          <p v-if="errors.region" class="text-xs text-red-400 mt-1">{{ errors.region }}</p>
        </div>

        <!-- PC Cafe Name -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">
            PC방 이름 <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <Building2 :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              v-model="formData.pcCafe"
              type="text"
              placeholder="예: 게임존 PC방"
              class="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
              :class="{ 'border-red-500/50': errors.pcCafe }"
            />
          </div>
          <p v-if="errors.pcCafe" class="text-xs text-red-400 mt-1">{{ errors.pcCafe }}</p>
        </div>
      </div>

      <!-- Incident Info Section -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 class="text-white font-bold mb-4 flex items-center">
          <AlertTriangle :size="18" class="mr-2" />
          사건 정보
        </h2>

        <!-- Danger Level -->
        <div class="mb-4">
          <label class="block text-sm text-gray-400 mb-3">
            위험도 <span class="text-red-500">*</span>
          </label>
          <div class="space-y-2">
            <button
              v-for="level in dangerLevels"
              :key="level.value"
              @click="formData.dangerLevel = level.value"
              class="w-full p-3 rounded-lg border-2 transition-all text-left"
              :class="
                formData.dangerLevel === level.value
                  ? `${level.color} border-current`
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              "
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold">{{ level.value }}</span>
                <span
                  v-if="formData.dangerLevel === level.value"
                  class="w-5 h-5 rounded-full bg-white flex items-center justify-center"
                >
                  <span class="text-xs">✓</span>
                </span>
              </div>
              <p class="text-xs opacity-75">{{ level.description }}</p>
            </button>
          </div>
        </div>

        <!-- Reason -->
        <div class="mb-4">
          <label class="block text-sm text-gray-400 mb-3">
            사유 <span class="text-red-500">*</span>
          </label>
          <div class="flex flex-wrap gap-2 mb-3">
            <button
              v-for="reason in commonReasons"
              :key="reason"
              @click="selectReason(reason)"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="
                formData.reason === reason
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              "
            >
              {{ reason }}
            </button>
          </div>
          <input
            v-model="formData.reason"
            type="text"
            placeholder="또는 직접 입력"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
            :class="{ 'border-red-500/50': errors.reason }"
          />
          <p v-if="errors.reason" class="text-xs text-red-400 mt-1">{{ errors.reason }}</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm text-gray-400 mb-2 flex items-center justify-between">
            <span>
              상세 내용 <span class="text-red-500">*</span>
            </span>
            <span class="text-xs" :class="formData.description.length >= 20 ? 'text-green-400' : 'text-gray-600'">
              {{ formData.description.length }} / 최소 20자
            </span>
          </label>
          <textarea
            v-model="formData.description"
            rows="6"
            placeholder="구체적인 상황을 자세히 설명해주세요&#10;&#10;- 발생 일시&#10;- 구체적인 행동&#10;- 피해 내용&#10;- 조치 사항 등"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 resize-none"
            :class="{ 'border-red-500/50': errors.description }"
          ></textarea>
          <p v-if="errors.description" class="text-xs text-red-400 mt-1">{{ errors.description }}</p>
        </div>
      </div>

      <!-- Evidence Section -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 class="text-white font-bold mb-4 flex items-center">
          <Camera :size="18" class="mr-2" />
          증거 사진 (선택)
        </h2>

        <!-- Image Upload -->
        <div class="mb-3">
          <label
            class="w-full h-32 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 transition-colors"
          >
            <Camera :size="32" class="text-gray-600 mb-2" />
            <span class="text-sm text-gray-500">사진 추가 (최대 5장, 5MB 이하)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleImageUpload"
            />
          </label>
        </div>

        <!-- Image Preview -->
        <div v-if="formData.images.length > 0" class="grid grid-cols-3 gap-2">
          <div
            v-for="image in formData.images"
            :key="image.id"
            class="relative aspect-square rounded-lg overflow-hidden bg-gray-800"
          >
            <img :src="image.url" alt="증거 사진" class="w-full h-full object-cover" />
            <button
              @click="removeImage(image.id)"
              class="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
            >
              <X :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="sticky bottom-20 pt-4">
        <button
          @click="handleSubmit"
          :disabled="!isFormValid"
          class="w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95"
          :class="
            isFormValid
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          "
        >
          {{ isFormValid ? "블랙리스트 등록" : "필수 항목을 모두 입력해주세요" }}
        </button>
      </div>
    </div>
  </div>
</template>
