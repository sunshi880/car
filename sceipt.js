// Global variables (only one declaration for currentConfig)
let currentConfig = {
    color: 'Midnight Black',
    colorBg: '#1a1a1a',
    wheel: 'standard',
    wheelPrice: 0,
    model: 'Pro',
    basePrice: 55000,
    downPayment: 10000
};



// Initialize the website after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeScrollAnimations();
    initializeStats();
    initializeConfigurator();
    initializeForm();
    updatePricing();
});

// Navigation functionality
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('visible');
        } else {
            navbar.classList.remove('visible');
        }
        updateActiveNavLink();
    });

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

function updateActiveNavLink() {
    const sections = ['hero', 'stats', 'features', 'configurator', 'preorder'];
    const navLinks = document.querySelectorAll('.nav-link');
    let currentSection = 'hero';

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = sectionId;
            }
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Scroll animations and progress
function initializeScrollAnimations() {
    const scrollHud = document.getElementById('scroll-hud');
    const progressBar = document.querySelector('.progress-bar');
    const progressPercentage = document.querySelector('.progress-percentage');
    const indicators = document.querySelectorAll('.indicator');
    const progressIcon = document.querySelector('.progress-icon');

    const icons = ['🚗', '⚡', '🔧', '🎨', '📋'];
    const sections = ['hero', 'stats', 'features', 'configurator', 'preorder'];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    const animatedElements = document.querySelectorAll('.section-title, .stat-card, .feature-card');
    animatedElements.forEach(el => observer.observe(el));

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min((scrollTop / docHeight) * 100, 100);

        if (scrollTop > 200) {
            scrollHud.classList.add('visible');
        } else {
            scrollHud.classList.remove('visible');
        }

        const circumference = 2 * Math.PI * 45;
        const strokeDashoffset = circumference * (1 - progress / 100);
        progressBar.style.strokeDashoffset = strokeDashoffset;
        progressPercentage.textContent = Math.round(progress) + '%';

        const sectionIndex = Math.min(Math.floor((progress / 100) * sections.length), sections.length - 1);

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === sectionIndex);
        });

        if (progressIcon && icons[sectionIndex]) {
            progressIcon.textContent = icons[sectionIndex];
        }
    });
}

// Animated statistics
function initializeStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateStats();
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.getElementById('stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    function animateStats() {
        statNumbers.forEach(stat => {
            const targetStr = stat.getAttribute('data-target');
            const target = parseFloat(targetStr);
            const isDecimal = targetStr.includes('.');
            let current = 0;
            const increment = target / 60; // 60 frames

            const updateStat = () => {
                if (current < target) {
                    current += increment;
                    if (isDecimal) {
                        stat.textContent = Math.min(current, target).toFixed(1);
                    } else {
                        stat.textContent = Math.floor(Math.min(current, target));
                    }
                    requestAnimationFrame(updateStat);
                } else {
                    stat.textContent = target;
                }
            };

            updateStat();
        });
    }
}

function initializeConfigurator() {
  const colorButtons = document.querySelectorAll('.color-btn');
  const wheelButtons = document.querySelectorAll('.wheel-btn');
  const modelSelect = document.getElementById('modelSelect');
  const downPaymentSlider = document.getElementById('downPayment');

  colorButtons.forEach(btn => {
    const color = btn.getAttribute('data-color');
    const bg = btn.getAttribute('data-bg');
    const imgSrc = btn.getAttribute('data-img'); // Added to get image filename

    btn.style.setProperty('--bg-color', bg);

    btn.addEventListener('click', () => {
      colorButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentConfig.color = color;
      currentConfig.colorBg = bg;

      // If you want to override image source directly from data-img instead of carImages:
      if (imgSrc) {
        const carImage = document.getElementById('carImage');
        if (carImage) {
          carImage.src = imgSrc;
        }
      } else {
        updateCarDisplay();
      }

      updatePricing();
    });
  });

 wheelButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    wheelButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentConfig.wheel = btn.getAttribute('data-wheel');
    currentConfig.wheelPrice = parseInt(btn.getAttribute('data-price'));

    // Get the updated image based on the current color and new wheel
    const carImage = document.getElementById('carImage');
    const color = currentConfig.color;
    const wheel = currentConfig.wheel;

    if (carImage && carImages[color] && carImages[color][wheel]) {
      carImage.src = carImages[color][wheel];
    }

    // Reapply color filter
    let filter = '';
    switch (color) {
      case 'Electric Blue':
        filter = 'hue-rotate(240deg)';
        break;
      case 'Crimson Red':
        filter = 'hue-rotate(0deg)';
        break;
      default:
        filter = '';
    }
    carImage.style.filter = filter;

    updatePricing();
  });
});

  if (modelSelect) {
    modelSelect.addEventListener('change', () => {
      const selectedOption = modelSelect.options[modelSelect.selectedIndex];
      currentConfig.model = selectedOption.value;
      currentConfig.basePrice = parseInt(selectedOption.getAttribute('data-price'));

      updateCarDisplay();
      updatePricing();
    });
  }

  if (downPaymentSlider) {
    downPaymentSlider.addEventListener('input', () => {
      currentConfig.downPayment = parseInt(downPaymentSlider.value);
      document.getElementById('downPaymentValue').textContent = currentConfig.downPayment.toLocaleString();
      updatePricing();
    });
  }

  // Initial update
  updateCarDisplay();
  updatePricing();
}

function updateCarDisplay() {
  const carContainer = document.getElementById('carContainer');
  const carImage = document.getElementById('carImage');
  const selectedColor = document.getElementById('selectedColor');
  const selectedModel = document.getElementById('selectedModel');
  const selectedWheel = document.getElementById('selectedWheel');

  if (carContainer) {
    carContainer.style.background = `linear-gradient(135deg, ${currentConfig.colorBg}20, ${currentConfig.colorBg}40)`;
    carContainer.style.border = `2px solid ${currentConfig.colorBg}30`;
  }

  if (carImage) {
    // Use carImages map only if data-img is not provided
    if (!carImage.src || !carImage.src.includes(currentConfig.color)) {
      const color = currentConfig.color;
      const wheel = currentConfig.wheel;
      const imageSrc = carImages[color] ? carImages[color][wheel] : "";
      if (imageSrc) {
        carImage.src = imageSrc;
      }
    }

    let filter = '';
    switch (currentConfig.color) {
      case 'Electric Blue':
        filter = 'hue-rotate(240deg)';
        break;
      case 'Crimson Red':
        filter = 'hue-rotate(0deg)';
        break;
      default:
        filter = '';
    }
    carImage.style.filter = filter;
  }

  if (selectedColor) selectedColor.textContent = currentConfig.color;
  if (selectedModel) selectedModel.textContent = currentConfig.model;
  if (selectedWheel) {
    const wheelNames = {
      'standard': '18" Standard Wheels',
      'sport': '20" Sport Alloy Wheels',
      'performance': '22" Performance Wheels'
    };
    selectedWheel.textContent = wheelNames[currentConfig.wheel];
  }
}


function updatePricing() {
  const basePrice = currentConfig.basePrice;
  const wheelPrice = currentConfig.wheelPrice;
  const colorPrice = currentConfig.color === 'Pearl White' ? 1000 : 0; 
  const subtotal = basePrice + wheelPrice + colorPrice;
  const tax = subtotal * 0.08;
  const totalPrice = subtotal + tax;
  const loanAmount = totalPrice - currentConfig.downPayment;
  const monthlyRate = 0.035 / 12; 
  const loanTerm = 60; 

  const monthlyPayment = loanAmount > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1)
    : 0;

  const basePriceEl = document.getElementById('basePrice');
  const wheelPriceLine = document.getElementById('wheelPriceLine');
  const wheelPriceEl = document.getElementById('wheelPrice');
  const taxAmountEl = document.getElementById('taxAmount');
  const totalPriceEl = document.getElementById('totalPrice');
  const monthlyPaymentEl = document.getElementById('monthlyPayment');

  if (basePriceEl) basePriceEl.textContent = `$${basePrice.toLocaleString()}`;
  if (wheelPriceLine && wheelPriceEl) {
    if (wheelPrice > 0) {
      wheelPriceLine.style.display = 'flex';
      wheelPriceEl.textContent = `+$${wheelPrice.toLocaleString()}`;
    } else {
      wheelPriceLine.style.display = 'none';
    }
  }
  if (taxAmountEl) taxAmountEl.textContent = `$${tax.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  if (totalPriceEl) totalPriceEl.textContent = `$${totalPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  if (monthlyPaymentEl) monthlyPaymentEl.textContent = `$${monthlyPayment.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
}

// Pre-order form handling
function initializeForm() {
  const form = document.getElementById('preorderForm');
  const formMessage = document.getElementById('formMessage');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Simple validation example
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const address = form.address.value.trim();

    if (!name || !email || !phone || !address) {
      showFormMessage('Please fill in all required fields.', 'error');
      return;
    }

    // Fake submission
    showFormMessage('Thank you for your pre-order! We will contact you soon.', 'success');

    form.reset();
  });

  function showFormMessage(message, type) {
    if (formMessage) {
      formMessage.textContent = message;
      formMessage.className = type === 'success' ? 'form-success' : 'form-error';
      formMessage.style.display = 'block';
      setTimeout(() => {
        formMessage.style.display = 'none';
      }, 5000);
    }
  }
}
