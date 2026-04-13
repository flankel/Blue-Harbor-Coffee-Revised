fetch("header.html")
  .then(res => res.text())
  .then(data => {
    const header = document.getElementById("header");

    header.innerHTML = data;

    // DOM確定後1フレーム待つ（重要）
    requestAnimationFrame(() => {

      let current = location.pathname.split("/").pop().split("?")[0] || "index.html";

      const takeoutPages = new Set([
        "takeout.html",
        "customer.html",
        "confirm.html",
        "complete.html"
      ]);

      const links = header.querySelectorAll(".nav-link");

      links.forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;

        if (href === current) {
          link.classList.add("active");
        }

        if (takeoutPages.has(current) && href === "takeout.html") {
          link.classList.add("active");
        }
      });
    });
  });
