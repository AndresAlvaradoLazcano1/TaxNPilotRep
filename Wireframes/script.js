const titles = {
  login: "Login",
  dashboard: "Dashboard",
  clients: "Clientes",
  "client-detail": "Detalle de Cliente",
  operations: "Operaciones",
  summary: "Resumen Financiero"
};

const buttons = document.querySelectorAll(".nav-item");
const screens = document.querySelectorAll(".screen");
const title = document.querySelector("#screen-title");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.screen;

    buttons.forEach((item) => item.classList.remove("active"));
    screens.forEach((screen) => screen.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(target).classList.add("active");
    title.textContent = titles[target];
  });
});
