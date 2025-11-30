import ImageGallery from "@/components/features/ImageGallery";
import { render, screen } from "@testing-library/react";

// Next.js Image mock
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt || ""} />;
  },
}));

// Embla Carousel mock
jest.mock("embla-carousel-react", () => ({
  __esModule: true,
  default: () => {
    return [
      () => null,
      {
        scrollNext: jest.fn(),
        scrollPrev: jest.fn(),
        selectedScrollSnap: () => 0,
        scrollSnapList: () => [0, 1, 2],
        on: jest.fn(),
        off: jest.fn(),
      },
    ];
  },
}));

describe.skip("ImageGallery", () => {
  const mockImages = [
    "/images/campground1.jpg",
    "/images/campground2.jpg",
    "/images/campground3.jpg",
  ];

  it("빈 이미지 배열일 때 플레이스홀더를 표시함", () => {
    render(<ImageGallery images={[]} />);

    expect(screen.getByText("이미지가 없습니다")).toBeInTheDocument();
  });

  it("모든 이미지를 렌더링함", () => {
    const { container } = render(<ImageGallery images={mockImages} />);

    const images = container.querySelectorAll("img");
    expect(images.length).toBe(mockImages.length);
  });

  it("이미지 카운터를 표시함", () => {
    render(<ImageGallery images={mockImages} />);

    // "1 / 3" 형식으로 표시되어야 함
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  it("커스텀 className을 적용함", () => {
    const { container } = render(
      <ImageGallery images={mockImages} className="custom-gallery" />
    );

    expect(container.firstChild).toHaveClass("custom-gallery");
  });

  it("aspect ratio prop을 받음 - 4/3", () => {
    const { container } = render(
      <ImageGallery images={mockImages} aspectRatio="4/3" />
    );

    // 컴포넌트가 렌더링되는지만 확인
    expect(container.firstChild).toBeTruthy();
  });

  it("aspect ratio prop을 받음 - 16/9", () => {
    const { container } = render(
      <ImageGallery images={mockImages} aspectRatio="16/9" />
    );

    expect(container.firstChild).toBeTruthy();
  });

  it("aspect ratio prop을 받음 - square", () => {
    const { container } = render(
      <ImageGallery images={mockImages} aspectRatio="square" />
    );

    expect(container.firstChild).toBeTruthy();
  });
});
