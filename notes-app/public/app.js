const API_BASE = "/api/notes";

const form = document.getElementById("note-form");
const titleInput = document.getElementById("note-title");
const bodyInput = document.getElementById("note-body");
const notesList = document.getElementById("notes-list");

function createNoteElement(note) {
  const el = document.createElement("article");
  el.className = "note";
  el.dataset.id = note.id;

  const title = document.createElement("strong");
  title.textContent = note.title || "بدون عنوان";

  const meta = document.createElement("div");
  meta.className = "meta";
  const date = new Date(note.id);
  meta.textContent = `شناسه: ${note.id} — ${date.toLocaleString()}`;

  const text = document.createElement("div");
  text.textContent = note.body || "";

  const actions = document.createElement("div");
  actions.className = "actions";

  const delBtn = document.createElement("button");
  delBtn.textContent = "حذف";
  delBtn.addEventListener("click", () => deleteNote(note.id));

  actions.appendChild(delBtn);

  el.appendChild(title);
  el.appendChild(meta);
  el.appendChild(text);
  el.appendChild(actions);

  return el;
}

function renderNotes(notes) {
  notesList.innerHTML = "";
  if (!notes.length) {
    notesList.textContent = "هیچ یادداشتی وجود ندارد.";
    return;
  }
  notes
    .sort((a, b) => b.id - a.id)
    .forEach((n) => {
      notesList.appendChild(createNoteElement(n));
    });
}

async function loadNotes() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("خطا در دریافت یادداشت‌ها");
    const notes = await res.json();
    renderNotes(Array.isArray(notes) ? notes : []);
  } catch (err) {
    notesList.textContent = "خطا در بارگذاری یادداشت‌ها";
    console.error(err);
  }
}

async function addNote(noteData) {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    });
    if (!res.ok) throw new Error("خطا در ذخیره یادداشت");
    const newNote = await res.json();
    await loadNotes();
    return newNote;
  } catch (err) {
    alert("خطا در ارسال یادداشت");
    console.error(err);
  }
}

async function deleteNote(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "خطا در حذف یادداشت");
    }
    await loadNotes();
  } catch (err) {
    alert("خطا در حذف یادداشت: " + (err.message || err));
    console.error(err);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title && !body) return alert("لطفاً عنوان یا متن وارد کنید.");

  const note = { title, body };

  form.querySelector("button").disabled = true;

  await addNote(note);

  titleInput.value = "";
  bodyInput.value = "";
  form.querySelector("button").disabled = false;
});

loadNotes();