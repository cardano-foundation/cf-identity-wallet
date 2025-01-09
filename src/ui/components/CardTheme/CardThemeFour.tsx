import { generateElementId } from "../../utils/idGenerator";
import { CardThemeBaseProps } from "./CardTheme.types";

const CardThemeFour = ({ className }: CardThemeBaseProps) => {
  const fillId = generateElementId();

  return (
    <svg className={className} width="350" height="200" viewBox="0 0 350 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_225_4990)">
        <rect width="350" height="200" fill={`url(#${fillId})`} />
        <g opacity="0.12">
          <path d="M244.946 115.354C237.828 107.223 229.025 104.616 218.026 106.008C218.447 115.399 218.669 124.768 219.356 134.092C219.756 139.44 224.789 138.247 228.138 139.197C229.601 139.617 231.375 138.954 232.839 139.373C234.058 139.727 235.012 140.942 236.098 141.782C235.012 142.379 233.903 143.506 232.817 143.483C224.811 143.351 216.806 142.688 208.801 142.798C202.437 142.887 196.095 143.815 189.731 144.389C186.804 144.655 184.83 144.08 185.806 140.257C188.6 139.926 191.394 139.572 194.188 139.241C200.22 138.556 201.683 137.385 201.86 130.446C202.371 110.869 202.548 91.2692 202.77 71.6695C202.792 69.1505 202.858 66.3 201.75 64.2229C200.863 62.5878 198.313 61.4387 196.272 60.9747C193.168 60.2455 189.864 60.2897 186.737 60.0025C185.784 56.3786 187.358 55.4727 190.241 55.6715C195.208 56.003 200.197 56.5333 205.165 56.4449C208.336 56.4007 211.529 55.5169 214.678 54.8319C222.483 53.1525 230.2 50.4788 238.072 49.9043C245.101 49.3961 252.109 51.3627 258.495 55.3622C268.651 61.7039 270.669 76.4865 263.085 86.5847C258.384 92.8601 252.353 97.2794 244.591 101.323C248.028 102.008 250.823 102.096 253.173 103.157C257.342 105.035 261.688 106.98 265.081 109.919C267.099 111.664 267.542 115.288 268.452 118.161C269.139 120.304 268.873 122.934 270.026 124.701C274.55 131.618 279.051 138.644 284.395 144.92C289.096 150.466 295.527 153.162 303.022 150.422C304.818 149.759 306.326 148.411 308.034 147.35C310.273 149.626 309.985 151.527 306.681 153.294C300.272 156.741 293.686 156.167 287.012 153.957C275.503 150.157 268.119 141.097 260.18 132.877C254.881 127.375 250.157 121.343 244.946 115.31M218.359 89.7887C218.359 96.9038 221.862 100.461 228.869 100.461C230.023 100.461 231.176 100.373 232.329 100.461C236.187 100.793 239.159 99.1356 241.775 96.5061C251.443 86.7394 251.953 71.1834 244.547 59.9804C242.196 56.4228 238.515 53.5282 233.615 54.6109C227.849 55.8925 221.685 56.9752 220.864 64.5986C220 72.708 219.179 80.8396 218.336 89.7666L218.359 89.7887Z" fill="#343B45" />
          <path d="M97.7952 146.377C94.1586 141.052 90.4554 136.124 87.3952 130.821C81.7628 121.076 76.3522 111.221 67.3492 103.973C61.6724 99.3995 56.2618 99.5983 51.7603 104.813C51.1616 105.52 50.4963 106.492 50.5185 107.332C50.6959 116.016 51.2059 124.722 51.2059 133.406C51.2059 138.289 54.4434 138.776 57.9027 139.218C59.7432 139.438 61.6503 139.328 63.513 139.24C66.5066 139.107 67.327 140.521 66.4622 143.836C59.4328 143.46 52.2925 142.51 45.2187 142.841C36.4818 143.283 27.8115 144.874 19.0968 145.736C17.8106 145.869 15.5266 145.029 15.2162 144.123C14.3957 141.803 16.0145 141.074 18.3206 140.897C21.8021 140.61 25.2392 139.593 28.7428 139.328C31.9138 139.085 32.6234 136.919 33.0891 134.599C33.6213 131.97 33.9539 129.274 33.9983 126.6C34.3531 107.133 34.6413 87.6662 34.8631 68.199C34.8853 65.8347 34.5748 63.3599 33.8652 61.106C33.5769 60.2001 31.8916 59.4709 30.7164 59.1836C28.5432 58.6533 26.1705 58.808 24.0639 58.123C22.7334 57.7032 21.7577 56.2448 20.6268 55.2504C20.8264 54.8085 21.0038 54.3887 21.2034 53.9467C25.2836 53.9467 29.4302 53.4385 33.4217 54.0572C43.2895 55.5819 52.9799 54.7643 62.7147 53.2175C63.9786 53.0187 65.4422 54.0793 66.817 54.5433C65.8635 55.5156 65.0652 56.974 63.9121 57.3938C62.1159 58.0567 60.0759 58.1893 58.1245 58.2335C54.1552 58.3219 51.4055 59.7581 51.3833 64.1112C51.3168 75.2479 51.3833 86.3845 51.3833 97.3666C61.5172 95.2232 84.446 69.326 84.0912 58.9627C81.3193 59.3162 78.614 59.7802 75.9087 59.9128C74.7778 59.957 73.0925 59.5593 72.5825 58.7859C72.0724 57.9904 72.3829 56.289 72.9373 55.2946C73.3142 54.5875 74.6669 54.013 75.5761 54.013C86.3752 53.9246 97.1743 53.9467 108.461 54.5654C97.0191 69.1271 82.0289 79.8881 67.7483 92.7263C69.6332 92.7263 71.0524 92.7263 72.4716 92.7263C85.2221 92.6158 96.2208 103.576 96.2208 116.414C96.2208 130.401 102.785 140.919 112.187 150.133C114.759 152.652 118.285 154.155 122.298 152.255C123.54 151.658 125.248 151.68 126.623 151.989C127.066 152.078 127.687 154.398 127.266 154.928C126.179 156.254 124.627 157.933 123.119 158.088C115.801 158.839 109.747 155.392 103.96 151.525C101.853 150.111 100.035 148.255 97.8618 146.399L97.7952 146.377Z" fill="#343B45" />
          <path d="M165.206 137.363C170.949 134.821 176.138 132.17 179.021 126.557C179.331 125.961 180.75 125.607 181.571 125.74C182.059 125.806 182.79 127.021 182.746 127.684C182.236 134.777 181.615 141.848 180.95 149.67C180.152 149.074 178.422 148.433 177.979 147.306C176.072 142.555 174.741 142.224 169.375 142.909C154.584 144.809 139.638 146.4 125.668 139.175C112.23 132.214 105.423 121.011 105.09 105.809C104.89 96.2408 105.334 86.8718 109.857 78.1658C116.044 66.2336 125.956 58.9638 138.907 55.7819C151.28 52.7326 163.698 53.8595 176.537 55.6714C177.912 52.0476 179.065 48.1807 180.906 44.6452C181.593 43.3194 183.788 42.6123 185.429 42.0378C186.072 41.8169 187.735 42.6123 187.824 43.1648C188.002 44.0707 187.602 45.4628 186.915 46.0815C179.93 52.4232 178.91 61.2398 176.87 69.6365C176.604 70.7634 175.894 71.7799 175.406 72.8626C174.453 72.2439 173.122 71.8462 172.59 70.9623C167.734 62.9191 160.239 58.7871 151.236 58.5882C146.956 58.4998 141.856 60.3559 138.441 63.0075C129.371 70.0563 126.289 80.4196 124.825 91.6668C141.656 93.2136 157.999 94.5394 174.541 86.8277C172.834 94.3184 171.37 100.837 169.774 107.908C167.379 105.809 165.716 103.466 163.476 102.605C160.261 101.345 156.646 100.726 153.187 100.616C145.138 100.351 137.066 100.616 128.994 100.483C126.045 100.439 124.825 101.301 124.959 104.394C125.513 118.05 132.808 134.114 146.224 137.805C152.611 139.572 158.686 138.976 165.206 137.407V137.363Z" fill="#1F242B" />
          <path d="M319.677 136.125C323.513 137.407 327.239 138.246 330.942 139.307C332.361 139.705 333.647 140.566 335 141.207C333.581 142.003 332.162 143.461 330.765 143.461C322.915 143.417 315.043 142.754 307.193 142.776C300.23 142.798 293.267 143.461 286.238 143.837C285.195 140.169 286.992 139.329 289.608 139.285C302.447 138.998 299.786 137.362 301.339 127.507C304.155 109.587 304.177 91.5119 303.955 73.4148C303.911 69.4595 303.689 65.46 302.957 61.5931C302.713 60.3115 300.762 58.7648 299.321 58.4333C296.992 57.903 294.42 58.5438 292.025 58.1682C290.872 57.9914 289.896 56.6214 288.854 55.7817C290.096 54.8979 291.316 53.2848 292.58 53.2627C304.953 53.0859 317.327 53.1301 329.7 53.2627C330.898 53.2627 332.095 54.2792 333.293 54.8316C332.406 55.9585 331.563 57.1517 330.609 58.2123C330.41 58.4333 329.789 58.2344 329.345 58.2786C320.963 58.8532 320.742 58.8973 320.431 67.4929C319.744 86.8716 319.189 106.25 318.724 125.651C318.635 129.01 319.278 132.413 319.677 136.125Z" fill="#1F242B" />
        </g>
      </g>
      <defs>
        <linearGradient id={fillId} x1="99.569" y1="76.9231" x2="580.321" y2="77.5587" gradientUnits="userSpaceOnUse">
          <stop stopColor="none" />
          <stop offset="1" stopColor="none" />
        </linearGradient>
        <clipPath id="clip0_225_4990">
          <rect width="350" height="200" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
export { CardThemeFour };