window.addEventListener('load', () => {

  // Target the main content container of your page (Adjust if needed)
  const mainContent = document.querySelector('.pagepiling'); 
  const preloader = document.querySelector('.preloader');
  const body = document.body;

  if (!preloader) {
    console.warn('Preloader element not found. Skipping preloader.');
    if (mainContent) mainContent.classList.add('main-content-visible'); 
    if (body) body.classList.remove('preloader-body-hidden');
    return;
  }
  
  if (!mainContent) {
       console.warn('Main content element (#pagepiling) not found. Preloader will run but content won\'t be revealed automatically.');
  }

  // Hide main content and prevent body scroll initially
  if(mainContent) mainContent.classList.add('main-content-hidden');
  body.classList.add('preloader-body-hidden');

  // Ensure SplitType and GSAP are loaded
  if (typeof SplitType === 'undefined' || typeof gsap === 'undefined') {
    console.error('SplitType or GSAP is not loaded. Preloader cannot run.');
    preloader.style.display = 'none'; // Hide preloader
    if(mainContent) {
       mainContent.classList.remove('main-content-hidden');
       mainContent.classList.add('main-content-visible');
    }
    body.classList.remove('preloader-body-hidden');
    return;
  }

  // Initialize splits
  const loadingText = new SplitType(".loading-text.initial", { types: "chars" });
  const completeText = new SplitType(".loading-text.complete", { types: "chars" });

  // Initial states
  gsap.set(".loading-text.complete", { y: "100%" });
  gsap.set(loadingText.chars, { opacity: 0, y: 100 });
  gsap.set(completeText.chars, { opacity: 0, y: 100 });

  // Calculate final position for percentage
  const getXPosition = () => {
    const wrap = document.querySelector(".percentage-wrap");
    const percentage = document.querySelector(".percentage");
    if (!wrap || !percentage) {
        console.error("Preloader: Wrap or Percentage element not found for getXPosition");
        return 0;
    }
    const wrapWidth = wrap.offsetWidth;
    const percentageWidth = percentage.offsetWidth;
    console.log("Preloader getXPosition:", { wrapWidth, percentageWidth }); // Log widths
    const xPos = wrapWidth > 0 ? wrapWidth - percentageWidth : 0;
    console.log("Preloader calculated xPos:", xPos);
    return xPos; // Return calculated position
  };

  // Define color stages based on your page background/foreground if needed
  // These are examples - replace with your actual theme colors if you want color transitions
  const colorStages = [
    { bg: "#c0c0c0", text: "#1c2526" }, // Matches initial state assumed in preloader.css
    { bg: "#9a8c98", text: "#1c2526" }, // Example stage 2
    { bg: "#1c2526", text: "#c0c0c0" }, // Example stage 3
    { bg: "#4a525c", text: "#c0c0c0" }  // Example stage 4
  ];

  function updateColors(progress) {
    const stage = Math.floor(progress / 25); // 4 stages (0-24, 25-49, 50-74, 75-100)
    const progressBar = document.querySelector(".progress-bar");
    const loadingTexts = document.querySelectorAll(".loading-text"); // Get all loading text elements
    
    if (stage < colorStages.length && progressBar && preloader) {
      try {
        const bgColor = colorStages[stage].bg;
        const textColor = colorStages[stage].text;

        progressBar.style.backgroundColor = textColor;
        preloader.style.backgroundColor = bgColor;

      } catch (e) {
          console.error("Error updating colors:", e);
      }
    }
  }

  // Animate in loading text
  gsap.to(loadingText.chars, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.05,
    ease: "power2.out"
  });

  const tl = gsap.timeline();

  tl.to(".progress-bar", {
    width: "100%",
    duration: 5, // Adjust duration as needed
    ease: "power1.inOut",
    onUpdate: function () {
      const progress = Math.round(this.progress() * 100);
      const percentageEl = document.querySelector(".percentage");
      if (percentageEl) {
        percentageEl.textContent = progress;
      }
      updateColors(progress);
    },
    onStart: () => {
      gsap.set(".percentage", { x: 0 });
    }
  })
    .to(
      ".percentage",
      {
        x: getXPosition, // Use the function directly
        duration: 5, // Match progress bar duration
        ease: "power1.inOut"
      },
      "<0.1" 
    )
    .to(
      ".loading-text.initial .char", 
      {
        y: "-100%",
        opacity: 0,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.inOut"
      },
      "-=0.8" 
    )
    .to(
      ".loading-text.complete",
      {
        y: "0%",
        duration: 0.5,
        ease: "power2.inOut"
      },
      "<"
    )
    .to(
      completeText.chars,
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.out"
      },
      "<0.2"
    )
    .to([".percentage-wrap", ".text-container"], { 
      y: -50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.inOut"
    })
    .to(
      ".preloader",
      {
        y: "-100%", // Changed from -100vh to -100% for consistency
        duration: 1, 
        ease: "power2.inOut",
        onComplete: () => {
          preloader.style.display = 'none'; 
          body.classList.remove('preloader-body-hidden'); 
          if(mainContent){
             mainContent.classList.remove('main-content-hidden');
             mainContent.classList.add('main-content-visible');
          }
          window.dispatchEvent(new Event('resize')); // Trigger resize for layout recalculations
        }
      },
      "<0.3"
    );

  // Update percentage position on window resize --- COMMENTED OUT
  /*
  window.addEventListener("resize", () => {
    try {
      const progressWidth = gsap.getProperty(".progress-bar", "width", "px");
      const totalWidth = window.innerWidth;
      const progress = totalWidth > 0 ? progressWidth / totalWidth : 0;
      const newX = getXPosition(); 
      console.log("Preloader resize: newX=", newX, "progress=", progress); // Log resize values
      gsap.to(".percentage", { x: newX * progress, duration: 0.3 }); 
    } catch(e) {
        console.error("Error on resize:", e);
    }
  });
  */

}); 