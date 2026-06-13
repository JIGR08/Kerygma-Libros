const KerygmaCatalog = (() => {
  const storageKey = "kerygma-libros-catalogo";
  const sampleBooks = [
    {
      title: "Biblia de Estudio",
      author: "Editorial Vida",
      category: "Biblias",
      price: "$599 MXN",
      image: "",
      url: "https://listado.mercadolibre.com.mx/biblia-de-estudio-cristiana"
    },
    {
      title: "Devocional para cada dia",
      author: "Kerygma Libros",
      category: "Devocionales",
      price: "$249 MXN",
      image: "",
      url: "https://listado.mercadolibre.com.mx/devocional-cristiano"
    },
    {
      title: "Introduccion a la teologia cristiana",
      author: "Varios autores",
      category: "Teologia",
      price: "$389 MXN",
      image: "",
      url: "https://listado.mercadolibre.com.mx/teologia-cristiana-libro"
    },
    {
      title: "Oraciones para la familia",
      author: "Kerygma Libros",
      category: "Familia",
      price: "$199 MXN",
      image: "",
      url: "https://listado.mercadolibre.com.mx/libro-cristiano-familia"
    }
  ];

  function getCustomBooks() {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  }

  function saveCustomBooks(books) {
    localStorage.setItem(storageKey, JSON.stringify(books));
  }

  function getBooks() {
    return [...sampleBooks, ...getCustomBooks()];
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function coverFor(book) {
    if (book.image) {
      return `<img src="${escapeHtml(book.image)}" alt="Portada de ${escapeHtml(book.title)}" loading="lazy" />`;
    }

    const initials = book.title
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    return `<div class="cover-placeholder" aria-hidden="true">${escapeHtml(initials)}</div>`;
  }

  function mountCatalog() {
    const grid = document.querySelector("#bookGrid");
    const searchInput = document.querySelector("#searchInput");
    const filterButtons = document.querySelectorAll(".filter");
    if (!grid || !searchInput) return;

    let activeCategory = "Todos";

    function renderBooks() {
      const query = searchInput.value.trim().toLowerCase();
      const books = getBooks().filter((book) => {
        const matchesCategory = activeCategory === "Todos" || book.category === activeCategory;
        const matchesSearch = [book.title, book.author, book.category]
          .join(" ")
          .toLowerCase()
          .includes(query);
        return matchesCategory && matchesSearch;
      });

      if (!books.length) {
        grid.innerHTML = `<p class="empty-state">No encontramos libros con ese filtro.</p>`;
        return;
      }

      grid.innerHTML = books
        .map(
          (book) => `
            <article class="book-card">
              <div class="book-cover">${coverFor(book)}</div>
              <div class="book-info">
                <span class="category">${escapeHtml(book.category)}</span>
                <h3>${escapeHtml(book.title)}</h3>
                <p>${escapeHtml(book.author)}</p>
                <strong>${escapeHtml(book.price)}</strong>
                <a class="button buy" href="${escapeHtml(book.url)}" target="_blank" rel="noreferrer">
                  Comprar en Mercado Libre
                </a>
              </div>
            </article>
          `
        )
        .join("");
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        renderBooks();
      });
    });

    searchInput.addEventListener("input", renderBooks);
    window.addEventListener("storage", renderBooks);
    document.addEventListener("kerygma:catalog-updated", renderBooks);
    renderBooks();
  }

  function mountAdminForm() {
    const form = document.querySelector("#bookForm");
    const clearButton = document.querySelector("#clearCustomBooks");
    const formNote = document.querySelector("#formNote");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const book = Object.fromEntries(data.entries());
      saveCustomBooks([...getCustomBooks(), book]);
      form.reset();
      if (formNote) formNote.textContent = "Libro agregado al catalogo.";
      document.dispatchEvent(new CustomEvent("kerygma:catalog-updated"));
    });

    clearButton?.addEventListener("click", () => {
      saveCustomBooks([]);
      if (formNote) formNote.textContent = "Se limpiaron los libros agregados.";
      document.dispatchEvent(new CustomEvent("kerygma:catalog-updated"));
    });
  }

  return {
    mountAdminForm,
    mountCatalog
  };
})();
