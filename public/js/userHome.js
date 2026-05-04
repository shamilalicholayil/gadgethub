// Set deal end time (24 hours from now)
  const dealEndTime = new Date("April 14, 2026 00:00:00").getTime();

  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = dealEndTime - now;

    if (distance <= 0) {
      clearInterval(timer);
      document.getElementById("hours").innerText = "00";
      document.getElementById("minutes").innerText = "00";
      document.getElementById("seconds").innerText = "00";
      return;
    }

    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');

  }, 1000);