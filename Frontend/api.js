const API_HOST = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? window.location.hostname
  : "localhost";
const API_BASE_URL = `http://${API_HOST}:3000`;
const TOKEN_KEY = "taxnpilot_token";

async function apiRequest(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {})
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data && data.error ? data.error : "Error al comunicarse con el backend");
  }

  return data;
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

function requireAuth() {
  if (!localStorage.getItem(TOKEN_KEY)) {
    window.location.href = "index.html";
    return false;
  }

  return true;
}

function setupLogout() {
  const logoutLink = document.querySelector("[data-logout]");

  if (logoutLink) {
    logoutLink.addEventListener("click", () => {
      window.taxApi.clearToken();
    });
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(value));
}

window.taxApi = {
  register(credentials) {
    return apiRequest("/api/register", {
      method: "POST",
      body: credentials
    });
  },

  login(credentials) {
    return apiRequest("/api/login", {
      method: "POST",
      body: credentials
    });
  },

  getUsers() {
    return apiRequest("/api/users");
  },

  getClients() {
    return apiRequest("/api/clients");
  },

  createClient(client) {
    return apiRequest("/api/clients", {
      method: "POST",
      body: client
    });
  },

  updateClient(id, client) {
    return apiRequest(`/api/clients/${id}`, {
      method: "PUT",
      body: client
    });
  },

  deleteClient(id) {
    return apiRequest(`/api/clients/${id}`, {
      method: "DELETE"
    });
  },

  getCategories() {
    return apiRequest("/api/categories");
  },

  createCategory(category) {
    return apiRequest("/api/categories", {
      method: "POST",
      body: category
    });
  },

  updateCategory(id, category) {
    return apiRequest(`/api/categories/${id}`, {
      method: "PUT",
      body: category
    });
  },

  deleteCategory(id) {
    return apiRequest(`/api/categories/${id}`, {
      method: "DELETE"
    });
  },

  getOperations(filters = {}) {
    return apiRequest(`/api/operations${buildQuery(filters)}`);
  },

  createOperation(operation) {
    return apiRequest("/api/operations", {
      method: "POST",
      body: operation
    });
  },

  getSummary(filters = {}) {
    return apiRequest(`/api/operations/summary${buildQuery(filters)}`);
  },

  saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  requireAuth,
  setupLogout,
  formatCurrency,
  formatDate
};
