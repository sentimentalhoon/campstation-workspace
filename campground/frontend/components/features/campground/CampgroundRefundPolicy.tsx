"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function CampgroundRefundPolicy() {
  const [isRefundPolicyOpen, setIsRefundPolicyOpen] = useState(false);

  return (
    <section className="border-t border-neutral-200 px-4 py-6">
      <button
        onClick={() => setIsRefundPolicyOpen(!isRefundPolicyOpen)}
        className="flex w-full items-center justify-between"
      >
        <h2 className="text-base font-bold">환불 정책</h2>
        {isRefundPolicyOpen ? (
          <ChevronUp className="h-5 w-5 text-neutral-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-600" />
        )}
      </button>

      {isRefundPolicyOpen && (
        <div className="transition-all duration-300 ease-in-out">
          <div className="mt-4 mb-4 flex items-center gap-2 border-b border-neutral-200 pb-2">
            <button className="border-b-2 border-neutral-900 pb-2 text-base font-bold text-neutral-900">
              평일
            </button>
            <button className="pb-2 text-base text-neutral-500">주말</button>
          </div>

          <div className="space-y-3">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
              비성수기
            </h3>
            {[
              { period: "입실일로부터 8일 전 까지", rate: "100%" },
              { period: "입실일로부터 7일 전 까지", rate: "70%" },
              { period: "입실일로부터 6일 전 까지", rate: "70%" },
              { period: "입실일로부터 5일 전 까지", rate: "50%" },
              { period: "입실일로부터 4일 전 까지", rate: "50%" },
              { period: "입실일로부터 3일 전 까지", rate: "30%" },
              { period: "입실일로부터 2일 전 까지", rate: "30%" },
              { period: "입실일로부터 1일 전 까지", rate: "0%" },
              { period: "입실일로부터 예약당일 까지", rate: "0%" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-neutral-700">{item.period}</span>
                <span
                  className={`text-sm font-semibold ${
                    item.rate === "0%"
                      ? "text-red-600"
                      : item.rate === "100%"
                        ? "text-green-600"
                        : "text-orange-600"
                  }`}
                >
                  {item.rate}
                </span>
              </div>
            ))}

            <h3 className="mt-6 mb-3 text-sm font-semibold text-neutral-900">
              성수기
            </h3>
            {[
              { period: "입실일로부터 8일 전 까지", rate: "100%" },
              { period: "입실일로부터 7일 전 까지", rate: "70%" },
              { period: "입실일로부터 6일 전 까지", rate: "70%" },
              { period: "입실일로부터 5일 전 까지", rate: "50%" },
              { period: "입실일로부터 4일 전 까지", rate: "50%" },
              { period: "입실일로부터 3일 전 까지", rate: "30%" },
              { period: "입실일로부터 2일 전 까지", rate: "30%" },
              { period: "입실일로부터 1일 전 까지", rate: "0%" },
              { period: "입실일로부터 예약당일 까지", rate: "0%" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-neutral-700">{item.period}</span>
                <span
                  className={`text-sm font-semibold ${
                    item.rate === "0%"
                      ? "text-red-600"
                      : item.rate === "100%"
                        ? "text-green-600"
                        : "text-orange-600"
                  }`}
                >
                  {item.rate}
                </span>
              </div>
            ))}

            <h3 className="mt-6 mb-3 text-sm font-semibold text-neutral-900">
              극성수기
            </h3>
            {[
              { period: "입실일로부터 8일 전 까지", rate: "100%" },
              { period: "입실일로부터 7일 전 까지", rate: "70%" },
              { period: "입실일로부터 6일 전 까지", rate: "70%" },
              { period: "입실일로부터 5일 전 까지", rate: "50%" },
              { period: "입실일로부터 4일 전 까지", rate: "50%" },
              { period: "입실일로부터 3일 전 까지", rate: "30%" },
              { period: "입실일로부터 2일 전 까지", rate: "30%" },
              { period: "입실일로부터 1일 전 까지", rate: "0%" },
              { period: "입실일로부터 예약당일 까지", rate: "0%" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-neutral-700">{item.period}</span>
                <span
                  className={`text-sm font-semibold ${
                    item.rate === "0%"
                      ? "text-red-600"
                      : item.rate === "100%"
                        ? "text-green-600"
                        : "text-orange-600"
                  }`}
                >
                  {item.rate}
                </span>
              </div>
            ))}

            <div className="mt-6 rounded-lg bg-neutral-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-neutral-900">
                (극)성수기 기간 안내
              </h4>
              <div className="space-y-1 text-xs text-neutral-600">
                <p>[(극)성수기] 07월 21일 ~08월 17일</p>
                <p>[성수기] 06월 01일 ~07월 20일</p>
                <p>[성수기] 08월 18일 ~10월 31일</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
