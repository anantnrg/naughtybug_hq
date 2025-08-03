import "./App.css";
import connectedIcon from "./assets/icons/connected.svg";

function App() {
  return (
    <main class="bg-bg h-screen w-screen flex flex-col p-3 items-center justify-center gap-y-3">
      <div class="w-full h-12 bg-header-bg border border-border flex items-center justify-between px-4">
        <span class="text-2xl text-heading uppercase font-semibold tracking-wider">
          NaughtyBug Core-x
        </span>
        <span class="text-lg text-heading uppercase flex gap-x-1 items-center justify-center">
          <img src={connectedIcon} class="w-5" /> Connected
        </span>
      </div>
      <div class="w-full h-full flex gap-x-3">
        <div class="w-4/5 h-full flex flex-col gap-y-3">
          <div class="w-full h-[55%] flex gap-x-3">
            <div class="w-1/2 h-full bg-panels border border-border">
              <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
                <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                  System Info
                </span>
              </div>
            </div>
            <div class="w-1/2 h-full bg-panels border border-border flex flex-col relative">
              <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
                <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                  Movement Control
                </span>
              </div>
              <div class="grid grid-cols-3 grid-rows-3  w-full h-full place-items-center px-[110px] py-14 gap-2">
                <div></div>
                <button class="control-btn w-16 h-16 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-dasharray="12"
                      stroke-dashoffset="12"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8l-7 7M12 8l7 7"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="12;0"
                      />
                    </path>
                  </svg>
                </button>
                <div></div>

                <button class="control-btn w-16 h-16">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-dasharray="12"
                      stroke-dashoffset="12"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12l7 -7M8 12l7 7"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="12;0"
                      />
                    </path>
                  </svg>
                </button>
                <button class="control-btn w-16 h-16">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-dasharray="64"
                      stroke-dashoffset="64"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.6s"
                        values="64;0"
                      />
                    </path>
                  </svg>
                </button>
                <button class="control-btn w-16 h-16 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m9 5l7 7l-7 7"
                    />
                  </svg>
                </button>

                <div></div>
                <button class="control-btn w-16 h-16 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-dasharray="12"
                      stroke-dashoffset="12"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 16l-7 -7M12 16l7 -7"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="12;0"
                      />
                    </path>
                  </svg>
                </button>
                <div></div>
              </div>
              <div class="absolute z-10 pointer-events-none w-full h-full flex items-center justify-center pt-12">
                <svg
                  width="310"
                  height="310"
                  viewBox="0 0 512 512"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M259.864 475C260.504 475 261.088 475.161 261.616 475.48C262.16 475.8 262.592 476.232 262.912 476.776C263.248 477.304 263.416 477.897 263.416 478.553V480.16H259.647V478.744H249.855V481.769H259.864C260.504 481.769 261.088 481.928 261.616 482.248C262.16 482.568 262.592 483 262.912 483.544C263.248 484.072 263.416 484.664 263.416 485.32V488.729C263.416 489.368 263.248 489.96 262.912 490.504C262.592 491.048 262.16 491.48 261.616 491.8C261.088 492.12 260.504 492.28 259.864 492.28H249.688C249.048 492.28 248.456 492.12 247.912 491.8C247.368 491.48 246.936 491.048 246.616 490.504C246.296 489.96 246.136 489.368 246.136 488.729V487.12H249.855V488.536H259.647V485.513H249.688C249.048 485.513 248.456 485.352 247.912 485.032C247.368 484.712 246.936 484.289 246.616 483.761C246.296 483.217 246.136 482.616 246.136 481.96V478.553C246.136 477.897 246.296 477.304 246.616 476.776C246.936 476.232 247.368 475.8 247.912 475.48C248.456 475.161 249.048 475 249.688 475H259.864ZM486.36 271.28C482.58 330.52 456.568 383.713 416.576 422.608L415.751 423.434L415.737 423.42C377.39 460.344 326.367 484.194 269.84 487.801V479.782C282.915 478.918 295.683 476.934 308.05 473.921L303.906 458.458C305.855 457.987 307.792 457.488 309.719 456.963L313.86 472.422C331.065 467.735 347.446 461.049 362.737 452.628L354.733 438.766C356.488 437.803 358.228 436.816 359.952 435.805L367.953 449.663C383.246 440.699 397.381 429.972 410.079 417.762L398.762 406.444C400.205 405.06 401.629 403.655 403.032 402.23L414.348 413.546C426.742 400.976 437.662 386.948 446.826 371.742L432.965 363.739C433.999 362.029 435.009 360.303 435.995 358.561L449.854 366.562C458.51 351.289 465.423 334.898 470.324 317.66L454.863 313.518C455.412 311.598 455.933 309.667 456.427 307.725L471.888 311.867C475.234 298.762 477.424 285.195 478.344 271.28H486.36ZM31.3359 271.28C32.2322 284.84 34.3337 298.07 37.5371 310.864L52.998 306.722C53.4824 308.666 53.9946 310.599 54.5332 312.521L39.0732 316.664C43.8061 333.611 50.4821 349.748 58.8457 364.818L72.707 356.815C73.6759 358.567 74.6681 360.303 75.6855 362.023L61.8271 370.024C70.7158 385.075 81.3147 398.995 93.3564 411.519L104.674 400.201C106.058 401.645 107.464 403.069 108.89 404.473L97.5732 415.789C109.97 428.013 123.785 438.802 138.749 447.888L146.753 434.025C148.46 435.066 150.183 436.081 151.922 437.073L143.92 450.933C158.973 459.529 175.12 466.43 192.1 471.374L196.243 455.911C198.159 456.473 200.086 457.007 202.024 457.515L197.882 472.974C211.411 476.52 225.439 478.831 239.84 479.783V487.799C203.65 485.489 169.716 474.885 139.92 457.862L139.918 457.866L134.722 454.866L134.748 454.818C117.806 444.548 102.283 432.171 88.5439 418.05L87.6855 417.191L87.6992 417.177C75.1656 404.16 64.138 389.683 54.8975 374.025L54.8398 374.06L51.8398 368.864L51.916 368.819C35.6775 339.602 25.5694 306.51 23.3213 271.28H31.3359ZM259.84 470.28H249.84V448.216C251.501 448.258 253.168 448.28 254.84 448.28C256.512 448.28 258.178 448.258 259.84 448.216V470.28ZM36.8398 250.053V252.67L26.6543 256.41L36.8398 260.128V262.746L21 268.511V264.88L30.4375 261.427L21 257.973V254.826L30.4375 251.351L21 247.896V244.288L36.8398 250.053ZM491.12 264.632H487.376V252.44H484.352V262.256H480.607V252.44H477.584V264.632H473.84V248.672H491.12V264.632ZM62.9033 251.28C62.8608 252.942 62.8398 254.609 62.8398 256.28C62.8398 257.952 62.8608 259.619 62.9033 261.28H40.8398V251.28H62.9033ZM468.84 261.28H446.776C446.819 259.619 446.84 257.952 446.84 256.28C446.84 254.609 446.819 252.942 446.776 251.28H468.84V261.28ZM239.84 32.7754C225.44 33.7273 211.412 36.0396 197.883 39.5859L202.024 55.0449C200.086 55.5523 198.158 56.0869 196.242 56.6484L192.099 41.1855C175.119 46.1299 158.974 53.031 143.921 61.627L151.922 75.4854C150.183 76.4773 148.46 77.4939 146.753 78.5342L138.75 64.6719C123.786 73.7578 109.97 84.5474 97.5732 96.7715L108.889 108.087C107.464 109.49 106.059 110.914 104.675 112.357L93.3574 101.04C81.3153 113.563 70.7161 127.484 61.8271 142.535L75.6855 150.536C74.6681 152.256 73.6759 153.993 72.707 155.744L58.8457 147.741C50.482 162.812 43.8062 178.948 39.0732 195.896L54.5332 200.038C53.9945 201.961 53.4824 203.894 52.998 205.839L37.5371 201.696C34.3337 214.49 32.2322 227.72 31.3359 241.28H23.3213C25.5693 206.05 35.6773 172.958 51.916 143.74L51.877 143.718L54.877 138.522L54.8975 138.534C74.4205 105.454 101.919 77.6412 134.748 57.7412L134.71 57.6738L139.906 54.6738L139.92 54.6973C169.716 37.6744 203.65 27.0692 239.84 24.7598V32.7754ZM269.84 24.7578C326.367 28.365 377.389 52.2163 415.736 89.1396L416.125 88.752L420.368 92.9951L420.006 93.3564C458.053 131.924 482.689 183.751 486.36 241.28H478.344C477.424 227.365 475.234 213.798 471.888 200.692L456.427 204.835C455.933 202.893 455.412 200.962 454.863 199.042L470.324 194.898C465.423 177.661 458.51 161.27 449.854 145.997L435.995 153.998C435.01 152.256 433.999 150.53 432.965 148.82L446.826 140.817C437.662 125.612 426.743 111.584 414.349 99.0137L403.032 110.33C401.628 108.905 400.205 107.499 398.761 106.114L410.078 94.7969C397.38 82.5871 383.246 71.8607 367.953 62.8965L359.952 76.7549C358.228 75.7434 356.488 74.7567 354.733 73.7939L362.737 59.9307C347.446 51.51 331.065 44.8247 313.86 40.1377L309.718 55.5967C307.792 55.0712 305.854 54.5727 303.906 54.1016L308.05 38.6387C295.683 35.6258 282.915 33.6407 269.84 32.7764V24.7578ZM259.84 64.3438C258.178 64.3013 256.512 64.2803 254.84 64.2803C253.168 64.2803 251.501 64.3013 249.84 64.3438V42.2803H259.84V64.3438ZM259.696 31.5205V20H263.464V37.2803H259.624L249.904 25.7119V37.2803H246.184V20H250.023L259.696 31.5205Z"
                    fill="#BCD3CE"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div class="w-full h-[45%] flex gap-x-3 bg-panels border border-border">
            <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
              <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                Terminal/Logs
              </span>
            </div>
          </div>
        </div>
        <div class="w-1/3 h-full flex flex-col gap-y-3">
          <div class="w-full h-[55%] bg-panels border border-border">
            <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
              <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                Radar
              </span>
            </div>
          </div>
          <div class="w-full h-[45%] bg-panels border border-border">
            <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
              <span class="text-xl text-heading uppercase font-semibold tracking-wide">
                Additional Controls
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
