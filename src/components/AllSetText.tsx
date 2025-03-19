import React, { useEffect, useRef } from "react";
import "../styles/AllSetText.css";

const AllSetText: React.FC = () => {
  // Use correct type for SVG ref
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Add explicit types for all parameters
    function setTextAnimation(
      delay: number,
      duration: number,
      strokeWidth: number,
      timingFunction: string,
      strokeColor: string,
      repeat: boolean
    ): void {
      if (!svgRef.current) return;

      const paths = svgRef.current.querySelectorAll("path");
      const mode = repeat ? "infinite" : "forwards";

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const length = path.getTotalLength();
        path.style.strokeDashoffset = `${length}px`;
        path.style.strokeDasharray = `${length}px`;
        path.style.strokeWidth = `${strokeWidth}px`;
        path.style.stroke = strokeColor;
        path.style.animation = `${duration}s svg-text-anim ${mode} ${timingFunction}`;
        path.style.animationDelay = `${i * delay}s`;
      }
    }

    // Call the animation function after a small delay to ensure SVG is fully loaded
    const timer = setTimeout(() => {
      setTextAnimation(0.1, 2.7, 2, "linear", "#ffffff", true);
    }, 100);

    // Cleanup function to remove the timeout if component unmounts
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 480.752 145.057"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-2xl"
      >
        <g
          id="svgGroup"
          strokeLinecap="round"
          fillRule="evenodd"
          fontSize="9pt"
          stroke="#000"
          strokeWidth="0.25mm"
          fill="none"
          style={{ stroke: "#000", strokeWidth: "0.25mm", fill: "none" }}
        >
          <path
            d="M 13.342 140.596 A 20.666 20.666 0 0 0 20.4 141.753 A 20.283 20.283 0 0 0 35.071 135.515 A 33.977 33.977 0 0 0 40.05 129.153 A 25.007 25.007 0 0 0 41.582 132.607 A 19.074 19.074 0 0 0 46.275 138.378 A 17.55 17.55 0 0 0 46.925 138.885 A 13.831 13.831 0 0 0 55.35 141.753 Q 59.583 141.753 64.01 139.492 A 31.3 31.3 0 0 0 68.7 136.503 Q 75.6 131.253 81.75 123.603 A 10.124 10.124 0 0 0 83.105 121.579 Q 83.923 119.976 84.293 117.95 A 20.299 20.299 0 0 0 84.6 114.303 A 15.12 15.12 0 0 0 84.536 112.88 Q 84.443 111.896 84.214 111.075 A 6.564 6.564 0 0 0 83.475 109.353 A 4.747 4.747 0 0 0 83.024 108.741 A 3.338 3.338 0 0 0 80.4 107.553 A 4.706 4.706 0 0 0 77.61 108.479 A 7.146 7.146 0 0 0 76.35 109.653 A 271.642 271.642 0 0 1 74.106 112.302 Q 70.574 116.418 67.904 119.149 A 59.021 59.021 0 0 1 65.4 121.578 Q 61.35 125.253 58.5 125.253 A 4.561 4.561 0 0 1 58.169 125.241 A 3.59 3.59 0 0 1 55.575 123.903 Q 54.45 122.553 54.45 120.303 Q 54.45 115.188 56.431 104.042 A 368.852 368.852 0 0 1 57.9 96.303 A 460.448 460.448 0 0 0 58.18 94.816 Q 60.15 84.25 60.15 81.303 A 7.275 7.275 0 0 0 60.147 81.091 Q 60.03 77.057 55.391 76.253 A 15.244 15.244 0 0 0 52.8 76.053 A 38.962 38.962 0 0 0 51.836 76.065 A 34.668 34.668 0 0 0 46.2 76.653 Q 45.673 74.332 44.96 73.013 A 5.01 5.01 0 0 0 44.325 72.078 A 2.651 2.651 0 0 0 43.753 71.596 Q 42.887 71.046 41.371 70.878 A 13.348 13.348 0 0 0 39.9 70.803 A 31.623 31.623 0 0 0 30.598 72.189 A 36.022 36.022 0 0 0 20.325 77.328 A 45.402 45.402 0 0 0 15.427 81.33 A 48.767 48.767 0 0 0 5.55 94.578 Q 0 105.303 0 117.303 A 42.598 42.598 0 0 0 0.004 117.84 Q 0.137 128.419 5.55 135.003 A 17.79 17.79 0 0 0 13.342 140.596 Z M 36.45 112.353 L 42 84.753 A 17.561 17.561 0 0 0 32.234 88.036 A 22.898 22.898 0 0 0 30.375 89.478 A 29.563 29.563 0 0 0 24.202 96.946 A 37.894 37.894 0 0 0 21.9 101.553 Q 18.75 109.053 18.75 117.453 Q 18.75 122.103 20.625 124.353 A 6.129 6.129 0 0 0 24.804 126.548 A 8.778 8.778 0 0 0 25.8 126.603 A 6.037 6.037 0 0 0 28.976 125.658 Q 30.577 124.683 32.1 122.703 Q 34.701 119.321 36.062 114.023 A 38.066 38.066 0 0 0 36.45 112.353 Z"
            id="0"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M 131.924 108.741 A 3.338 3.338 0 0 0 129.3 107.553 A 4.706 4.706 0 0 0 126.51 108.479 A 7.146 7.146 0 0 0 125.25 109.653 A 171.112 171.112 0 0 1 122.897 112.391 Q 119.171 116.63 116.218 119.347 A 39.114 39.114 0 0 1 113.4 121.728 A 17.148 17.148 0 0 1 109.538 123.944 A 18.104 18.104 0 0 1 102.6 125.253 Q 98.7 125.253 96.3 122.628 Q 94.575 120.741 93.548 117.033 A 32.291 32.291 0 0 1 92.85 113.853 A 259.567 259.567 0 0 0 102.755 99.371 A 217.205 217.205 0 0 0 119.7 67.203 A 167.361 167.361 0 0 0 123.618 56.998 Q 126.474 48.73 127.966 41.247 A 79.123 79.123 0 0 0 129.6 25.803 A 74.858 74.858 0 0 0 129.6 25.681 Q 129.588 17.978 127.989 12.496 A 23.572 23.572 0 0 0 125.475 6.678 A 17.491 17.491 0 0 0 123.82 4.409 A 12.245 12.245 0 0 0 114.15 0.003 A 18.883 18.883 0 0 0 103.224 3.518 Q 99.965 5.766 97.008 9.453 A 50.845 50.845 0 0 0 92.175 16.803 A 104.159 104.159 0 0 0 91.563 17.934 Q 87.01 26.473 83.59 36.674 A 169.521 169.521 0 0 0 78.225 57.003 A 298.497 298.497 0 0 0 76.99 63.483 Q 75.277 73.052 74.405 81.714 A 169.963 169.963 0 0 0 73.5 98.703 A 102.234 102.234 0 0 0 73.739 105.806 Q 74.733 120.073 79.875 129.753 Q 86.25 141.753 99.45 141.753 A 35.852 35.852 0 0 0 99.488 141.753 A 30.036 30.036 0 0 0 116.625 136.653 A 58.394 58.394 0 0 0 122.148 132.427 A 69.054 69.054 0 0 0 130.65 123.603 A 10.124 10.124 0 0 0 132.005 121.579 Q 132.823 119.976 133.193 117.95 A 20.299 20.299 0 0 0 133.5 114.303 A 15.12 15.12 0 0 0 133.436 112.88 Q 133.343 111.896 133.114 111.075 A 6.564 6.564 0 0 0 132.375 109.353 A 4.747 4.747 0 0 0 131.924 108.741 Z M 110.85 14.853 A 2.851 2.851 0 0 0 109.011 15.68 Q 106.937 17.488 104.577 23.248 A 82.629 82.629 0 0 0 103.05 27.303 A 145.929 145.929 0 0 0 99.935 37.484 Q 98.395 43.208 97.013 49.842 A 301.185 301.185 0 0 0 95.4 58.203 A 234.514 234.514 0 0 0 92.281 82.863 A 202.002 202.002 0 0 0 91.8 93.603 A 200.59 200.59 0 0 0 105.096 67.786 A 175.349 175.349 0 0 0 108.75 58.428 Q 115.05 40.803 115.05 26.253 A 47.263 47.263 0 0 0 114.926 22.671 Q 114.328 14.853 110.85 14.853 Z"
            id="1"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M 180.824 108.741 A 3.338 3.338 0 0 0 178.2 107.553 A 4.706 4.706 0 0 0 175.41 108.479 A 7.146 7.146 0 0 0 174.15 109.653 A 171.112 171.112 0 0 1 171.797 112.391 Q 168.071 116.63 165.118 119.347 A 39.114 39.114 0 0 1 162.3 121.728 A 17.148 17.148 0 0 1 158.438 123.944 A 18.104 18.104 0 0 1 151.5 125.253 Q 147.6 125.253 145.2 122.628 Q 143.475 120.741 142.448 117.033 A 32.291 32.291 0 0 1 141.75 113.853 A 259.567 259.567 0 0 0 151.655 99.371 A 217.205 217.205 0 0 0 168.6 67.203 A 167.361 167.361 0 0 0 172.518 56.998 Q 175.374 48.73 176.866 41.247 A 79.123 79.123 0 0 0 178.5 25.803 A 74.858 74.858 0 0 0 178.5 25.681 Q 178.488 17.978 176.889 12.496 A 23.572 23.572 0 0 0 174.375 6.678 A 17.491 17.491 0 0 0 172.72 4.409 A 12.245 12.245 0 0 0 163.05 0.003 A 18.883 18.883 0 0 0 152.124 3.518 Q 148.865 5.766 145.908 9.453 A 50.845 50.845 0 0 0 141.075 16.803 A 104.159 104.159 0 0 0 140.463 17.934 Q 135.91 26.473 132.49 36.674 A 169.521 169.521 0 0 0 127.125 57.003 A 298.497 298.497 0 0 0 125.89 63.483 Q 124.177 73.052 123.305 81.714 A 169.963 169.963 0 0 0 122.4 98.703 A 102.234 102.234 0 0 0 122.639 105.806 Q 123.633 120.073 128.775 129.753 Q 135.15 141.753 148.35 141.753 A 35.852 35.852 0 0 0 148.388 141.753 A 30.036 30.036 0 0 0 165.525 136.653 A 58.394 58.394 0 0 0 171.048 132.427 A 69.054 69.054 0 0 0 179.55 123.603 A 10.124 10.124 0 0 0 180.905 121.579 Q 181.723 119.976 182.093 117.95 A 20.299 20.299 0 0 0 182.4 114.303 A 15.12 15.12 0 0 0 182.336 112.88 Q 182.243 111.896 182.014 111.075 A 6.564 6.564 0 0 0 181.275 109.353 A 4.747 4.747 0 0 0 180.824 108.741 Z M 159.75 14.853 A 2.851 2.851 0 0 0 157.911 15.68 Q 155.837 17.488 153.477 23.248 A 82.629 82.629 0 0 0 151.95 27.303 A 145.929 145.929 0 0 0 148.835 37.484 Q 147.295 43.208 145.913 49.842 A 301.185 301.185 0 0 0 144.3 58.203 A 234.514 234.514 0 0 0 141.181 82.863 A 202.002 202.002 0 0 0 140.7 93.603 A 200.59 200.59 0 0 0 153.996 67.786 A 175.349 175.349 0 0 0 157.65 58.428 Q 163.95 40.803 163.95 26.253 A 47.263 47.263 0 0 0 163.826 22.671 Q 163.228 14.853 159.75 14.853 Z"
            id="2"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M 203.25 121.953 L 205.2 119.553 Q 213.45 109.353 217.65 102.753 Q 220.2 98.403 223.65 91.128 Q 227.1 83.853 230.4 76.053 Q 233.25 69.453 242.25 69.453 Q 245.366 69.453 247.079 69.866 A 5.733 5.733 0 0 1 248.1 70.203 Q 249.75 70.953 249.75 72.603 A 4.181 4.181 0 0 1 249.708 73.155 Q 249.629 73.737 249.404 74.574 A 25.303 25.303 0 0 1 249.15 75.453 A 21.175 21.175 0 0 1 247.878 78.622 A 24.106 24.106 0 0 1 247.5 79.353 A 35.118 35.118 0 0 0 246.076 82.567 Q 244.8 85.925 244.8 88.503 Q 244.8 90.363 245.877 92.532 A 15.624 15.624 0 0 0 246.375 93.453 Q 247.878 96.03 250.952 99.836 A 109.502 109.502 0 0 0 251.25 100.203 Q 256.05 106.503 258.525 110.928 Q 261 115.353 261 120.603 Q 261 121.751 260.824 123.603 A 75.652 75.652 0 0 1 260.7 124.803 A 22.082 22.082 0 0 0 265.289 122.278 Q 269.687 119.21 274.835 113.361 A 110.076 110.076 0 0 0 277.95 109.653 A 7.146 7.146 0 0 1 279.21 108.479 A 4.706 4.706 0 0 1 282 107.553 A 3.338 3.338 0 0 1 284.624 108.741 A 4.747 4.747 0 0 1 285.075 109.353 A 6.564 6.564 0 0 1 285.814 111.075 Q 286.043 111.896 286.136 112.88 A 15.12 15.12 0 0 1 286.2 114.303 A 18.637 18.637 0 0 1 285.783 118.359 Q 285.13 121.286 283.459 123.463 A 11.911 11.911 0 0 1 283.35 123.603 A 73.033 73.033 0 0 1 278.729 128.837 Q 273.717 133.957 269.025 136.278 A 32.598 32.598 0 0 1 261.918 138.766 Q 258.596 139.537 254.763 139.819 A 59.949 59.949 0 0 1 252.15 139.953 Q 246.15 145.053 237.9 145.053 A 27.127 27.127 0 0 1 233.384 144.701 Q 228.811 143.928 225.975 141.453 A 14.129 14.129 0 0 1 223.627 138.871 A 9.51 9.51 0 0 1 221.85 133.353 A 9.207 9.207 0 0 1 224.612 126.692 A 11.697 11.697 0 0 1 224.7 126.603 A 9.047 9.047 0 0 1 228.424 124.4 Q 229.852 123.945 231.584 123.81 A 19.503 19.503 0 0 1 233.1 123.753 Q 235.05 123.753 237.675 124.128 A 274.149 274.149 0 0 0 238.908 124.301 Q 240.097 124.466 240.947 124.57 A 61.024 61.024 0 0 0 241.65 124.653 Q 241.5 120.753 239.925 117.303 A 36.511 36.511 0 0 0 236.247 111.032 A 40.303 40.303 0 0 0 235.95 110.628 A 110.337 110.337 0 0 0 233.766 107.786 Q 232.716 106.466 231.73 105.325 A 65.728 65.728 0 0 0 231.45 105.003 Q 226.8 113.853 222.225 119.703 Q 217.65 125.553 212.25 130.803 Q 209.968 133.085 207.472 133.438 A 6.569 6.569 0 0 1 206.55 133.503 A 5.42 5.42 0 0 1 204.591 133.161 A 4.862 4.862 0 0 1 202.65 131.778 A 6.067 6.067 0 0 1 201.194 128.355 A 8.003 8.003 0 0 1 201.15 127.503 A 8.33 8.33 0 0 1 202.701 122.679 A 10.769 10.769 0 0 1 203.25 121.953 Z"
            id="4"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M 343.574 108.741 A 3.338 3.338 0 0 0 340.95 107.553 A 4.706 4.706 0 0 0 338.16 108.479 A 7.146 7.146 0 0 0 336.9 109.653 Q 330.6 117.303 321.975 122.028 A 51.59 51.59 0 0 1 317.923 124.032 Q 311.722 126.753 306.6 126.753 A 29.833 29.833 0 0 1 305.135 126.718 Q 302.328 126.58 300.052 125.9 A 12.381 12.381 0 0 1 292.35 119.853 Q 303.983 116.994 311.178 112.807 A 30.645 30.645 0 0 0 317.475 108.078 Q 324.9 100.653 324.9 90.303 A 25.021 25.021 0 0 0 324.437 85.372 A 17.189 17.189 0 0 0 319.65 76.278 A 17.297 17.297 0 0 0 311.74 71.831 A 23.78 23.78 0 0 0 305.7 71.103 Q 295.95 71.103 288.225 76.353 Q 280.5 81.603 276.15 90.528 Q 271.8 99.453 271.8 109.803 A 41.845 41.845 0 0 0 272.671 118.569 A 28.3 28.3 0 0 0 280.5 133.203 A 26.704 26.704 0 0 0 284.204 136.242 Q 292.305 141.753 304.95 141.753 Q 316.5 141.753 326.625 136.053 Q 332.083 132.98 336.212 129.602 A 43.493 43.493 0 0 0 342.3 123.603 A 10.124 10.124 0 0 0 343.655 121.579 Q 344.473 119.976 344.843 117.95 A 20.299 20.299 0 0 0 345.15 114.303 A 15.12 15.12 0 0 0 345.086 112.88 Q 344.993 111.896 344.764 111.075 A 6.564 6.564 0 0 0 344.025 109.353 A 4.747 4.747 0 0 0 343.574 108.741 Z M 289.95 107.853 L 289.95 108.153 Q 296.876 106.509 301.505 103.58 A 23.684 23.684 0 0 0 303.9 101.853 A 16.261 16.261 0 0 0 306.804 98.806 A 11.25 11.25 0 0 0 309 92.103 A 8.368 8.368 0 0 0 308.78 90.128 A 5.816 5.816 0 0 0 307.425 87.528 A 5.193 5.193 0 0 0 304.278 85.885 A 7.415 7.415 0 0 0 303.15 85.803 Q 298.12 85.803 294.508 91.1 A 21.588 21.588 0 0 0 293.775 92.253 A 26.624 26.624 0 0 0 290.581 100.864 A 36.869 36.869 0 0 0 289.95 107.853 Z"
            id="5"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M 339.45 85.353 L 333.6 85.353 A 19.163 19.163 0 0 1 331.562 85.253 Q 329.504 85.032 328.313 84.321 A 3.7 3.7 0 0 1 327.525 83.703 A 4.954 4.954 0 0 1 326.484 81.983 Q 325.95 80.548 325.95 78.453 Q 325.95 70.848 331.482 70.128 A 9.438 9.438 0 0 1 332.7 70.053 L 341.25 70.053 Q 343.8 53.553 349.05 39.903 A 88.65 88.65 0 0 1 353.627 29.817 Q 357.288 22.994 361.725 18.153 A 30.571 30.571 0 0 1 366.719 13.709 Q 370.381 11.153 374.29 10.384 A 17.627 17.627 0 0 1 377.7 10.053 A 11.339 11.339 0 0 1 383.209 11.376 Q 385.758 12.763 387.6 15.603 Q 391.2 21.153 391.2 29.553 A 50.743 50.743 0 0 1 377.06 64.799 A 71.296 71.296 0 0 1 371.7 70.053 L 388.5 70.053 A 8.652 8.652 0 0 1 389.728 70.134 Q 391.165 70.34 391.923 71.076 A 2.608 2.608 0 0 1 391.95 71.103 A 2.819 2.819 0 0 1 392.543 72.024 Q 392.898 72.877 392.977 74.204 A 13.427 13.427 0 0 1 393 75.003 Q 393 84.866 377.607 85.33 A 51.706 51.706 0 0 1 376.05 85.353 L 357.75 85.353 A 565.811 565.811 0 0 0 357.619 88.897 Q 357.503 92.338 357.467 94.903 A 152.909 152.909 0 0 0 357.45 97.053 A 105.009 105.009 0 0 0 357.68 104.272 Q 358.164 111.267 359.669 115.68 A 18.071 18.071 0 0 0 361.125 118.953 A 11.978 11.978 0 0 0 369.697 124.993 A 17.161 17.161 0 0 0 372.75 125.253 Q 379.2 125.253 384.15 121.353 A 53.551 53.551 0 0 0 387.42 118.534 Q 391.21 115.015 395.85 109.653 A 7.146 7.146 0 0 1 397.11 108.479 A 4.706 4.706 0 0 1 399.9 107.553 A 3.338 3.338 0 0 1 402.524 108.741 A 4.747 4.747 0 0 1 402.975 109.353 A 6.564 6.564 0 0 1 403.714 111.075 Q 403.943 111.896 404.036 112.88 A 15.12 15.12 0 0 1 404.1 114.303 A 20.299 20.299 0 0 1 403.793 117.95 Q 403.423 119.976 402.605 121.579 A 10.124 10.124 0 0 1 401.25 123.603 A 67.593 67.593 0 0 1 392.324 132.762 A 57.849 57.849 0 0 1 387.15 136.653 A 30.484 30.484 0 0 1 371.437 141.708 A 37.258 37.258 0 0 1 369.6 141.753 A 30.235 30.235 0 0 1 354.808 138.347 Q 339 129.645 339 98.703 Q 339 92.103 339.45 85.353 Z M 373.65 24.453 A 2.428 2.428 0 0 0 372.277 24.942 Q 370.582 26.112 368.625 30.078 A 47.058 47.058 0 0 0 366.92 34.018 Q 365.199 38.501 363.602 44.776 A 153.481 153.481 0 0 0 363.375 45.678 Q 360.9 55.653 359.25 67.803 A 55.016 55.016 0 0 0 368.2 58.057 A 47.064 47.064 0 0 0 372.525 50.628 Q 376.081 42.975 376.779 36.435 A 29.478 29.478 0 0 0 376.95 33.303 Q 376.95 26.472 374.984 24.914 A 2.088 2.088 0 0 0 373.65 24.453 Z"
            id="6"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M 433.5 39.903 L 433.65 46.053 A 6.038 6.038 0 0 1 431.833 50.419 A 7.743 7.743 0 0 1 431.775 50.478 A 5.656 5.656 0 0 1 429.718 51.76 Q 428.824 52.093 427.712 52.239 A 14.331 14.331 0 0 1 425.85 52.353 A 12.435 12.435 0 0 1 422.971 52.04 Q 420.369 51.421 418.725 49.578 Q 416.25 46.803 416.25 41.703 Q 416.25 34.203 419.925 27.978 A 24.301 24.301 0 0 1 426.984 20.447 A 31.891 31.891 0 0 1 431.1 18.003 A 33.472 33.472 0 0 1 439.319 15.22 Q 443.096 14.438 447.454 14.288 A 61.082 61.082 0 0 1 449.55 14.253 A 55.764 55.764 0 0 1 458.379 14.907 Q 462.969 15.644 466.688 17.213 A 25.842 25.842 0 0 1 472.575 20.628 Q 480.75 27.003 480.75 39.003 Q 480.75 48.453 475.95 56.103 A 53.657 53.657 0 0 1 471.258 62.417 Q 467.25 67.104 461.55 72.003 Q 454.874 77.69 450.847 81.645 A 85.586 85.586 0 0 0 449.25 83.253 A 67.577 67.577 0 0 0 446.852 85.862 Q 444.464 88.611 443.175 90.828 Q 441.3 94.053 440.1 98.253 A 15.13 15.13 0 0 1 439.228 100.695 Q 438.617 102.009 437.792 102.982 A 7.895 7.895 0 0 1 436.725 104.028 Q 434.4 105.903 431.4 105.903 Q 428.7 105.903 427.05 104.328 A 4.372 4.372 0 0 1 425.977 102.635 Q 425.473 101.257 425.547 99.228 A 15.019 15.019 0 0 1 425.55 99.153 A 44.994 44.994 0 0 1 427.231 89.315 A 37.074 37.074 0 0 1 430.05 82.353 A 47.307 47.307 0 0 1 433.531 76.837 Q 435.501 74.116 438.078 71.186 A 114.887 114.887 0 0 1 443.1 65.853 Q 451.029 58.063 454.83 52.466 A 39.003 39.003 0 0 0 455.4 51.603 A 24.075 24.075 0 0 0 458.38 45.07 A 20.825 20.825 0 0 0 459.15 39.453 A 13.235 13.235 0 0 0 458.516 35.17 Q 456.503 29.278 448.106 29.108 A 24.935 24.935 0 0 0 447.6 29.103 A 24.762 24.762 0 0 0 443.621 29.401 Q 439.579 30.061 437.1 32.178 A 10.305 10.305 0 0 0 434.457 35.526 A 9.918 9.918 0 0 0 433.5 39.903 Z M 421.89 141.401 A 19.335 19.335 0 0 0 425.7 141.753 A 18.77 18.77 0 0 0 429.132 141.453 A 12.887 12.887 0 0 0 436.35 137.628 Q 440.25 133.503 440.25 126.603 Q 440.25 123.748 439.557 121.525 A 10.229 10.229 0 0 0 436.875 117.078 Q 434.552 114.857 430.699 114.166 A 21.533 21.533 0 0 0 426.9 113.853 A 18.974 18.974 0 0 0 422.611 114.31 A 12.507 12.507 0 0 0 416.175 117.903 A 13.511 13.511 0 0 0 412.882 124.042 A 19.3 19.3 0 0 0 412.35 128.703 A 17.363 17.363 0 0 0 412.62 131.833 Q 413.298 135.531 415.673 138.096 A 12.157 12.157 0 0 0 415.725 138.153 A 10.084 10.084 0 0 0 417.863 139.884 Q 419.608 140.942 421.89 141.401 Z"
            id="7"
            vector-effect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
};

export default AllSetText;
