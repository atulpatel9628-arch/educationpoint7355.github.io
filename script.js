document.addEventListener("DOMContentLoaded", function () {

  const themeBtn = document.getElementById("themeBtn");

  if (!themeBtn) return;

  themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      themeBtn.textContent = "☀️";
    } else {
      themeBtn.textContent = "🌙";
    }

  });

});
