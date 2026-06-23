const ADMIN_PASSWORD = "Yasin254";

function login() {
  const pass = document.getElementById("adminPassword").value;
  const errorDiv = document.getElementById("loginError");
  if (pass === ADMIN_PASSWORD) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "block";
    loadComplaints();
  } else {
    errorDiv.classList.remove("hidden");
    document.getElementById("adminPassword").value = "";
    setTimeout(() => errorDiv.classList.add("hidden"), 3000);
  }
}

function logout() {
  document.getElementById("loginSection").style.display = "flex";
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("adminPassword").value = "";
}

async function loadComplaints() {
  try {
    const statusFilter = document.getElementById("statusFilter").value;

    let query = client.from("complaints").select("*").order("created_at", { ascending: false });
    if (statusFilter) query = query.eq("status", statusFilter);

    let { data, error } = await query;

    if (error) {
      console.error("Error loading complaints:", error);
      return;
    }

    const total = data ? data.length : 0;
    const pending = data ? data.filter(d => d.status === "Pending").length : 0;
    const resolved = data ? data.filter(d => d.status === "Resolved").length : 0;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("resolvedCount").textContent = resolved;
    document.getElementById("ticketCount").innerHTML = `Showing <span class="text-blue-400 font-bold">${total}</span> ticket${total !== 1 ? "s" : ""}`;

    let html = "";
    if (data && data.length > 0) {
      data.forEach(complaint => {
        const createdAt = new Date(complaint.created_at).toLocaleString();
        const statusColor = complaint.status === "Pending"
          ? "bg-yellow-900/60 text-yellow-400 border border-yellow-700"
          : complaint.status === "In Progress"
            ? "bg-blue-900/60 text-blue-400 border border-blue-700"
            : "bg-green-900/60 text-green-400 border border-green-700";

        html += `
          <div class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-8 transition-all shadow-lg">
            <!-- Card Header -->
            <div class="flex items-start justify-between mb-6">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-3xl font-extrabold text-blue-400">#${complaint.reference_number}</span>
                  <span class="px-4 py-1.5 rounded-full text-sm font-bold ${statusColor}">${complaint.status}</span>
                </div>
                <p class="text-zinc-500 text-sm flex items-center gap-1">
                  <i class="fa-regular fa-clock"></i> ${createdAt}
                </p>
              </div>
              <button onclick="copyToClipboard('${complaint.reference_number}')"
                      class="text-zinc-500 hover:text-zinc-100 transition-colors p-2 hover:bg-zinc-800 rounded-xl" title="Copy reference">
                <i class="fa-solid fa-copy text-lg"></i>
              </button>
            </div>

            <!-- Customer Details -->
            <div class="grid grid-cols-2 gap-5 mb-5">
              <div class="bg-zinc-950 rounded-2xl p-4">
                <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Name</p>
                <p class="font-semibold text-lg">${complaint.full_name}</p>
              </div>
              <div class="bg-zinc-950 rounded-2xl p-4">
                <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Email</p>
                <p class="font-semibold text-blue-400 text-lg truncate">${complaint.email}</p>
              </div>
              <div class="bg-zinc-950 rounded-2xl p-4">
                <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Phone</p>
                <p class="font-semibold text-lg">${complaint.phone || "N/A"}</p>
              </div>
              <div class="bg-zinc-950 rounded-2xl p-4">
                <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Company</p>
                <p class="font-semibold text-lg">${complaint.company || "N/A"}</p>
              </div>
            </div>

            <div class="bg-zinc-950 rounded-2xl p-4 mb-5">
              <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Issue Type</p>
              <p class="font-bold text-orange-400 text-lg">${complaint.category}</p>
            </div>

            <div class="bg-zinc-950 rounded-2xl p-4 mb-6">
              <p class="text-zinc-500 text-xs uppercase tracking-wide mb-2">Message</p>
              <p class="text-base leading-relaxed">${complaint.message}</p>
            </div>

            <!-- Quick Contact -->
            <div class="flex gap-2 mb-4">
              <a href="https://wa.me/${complaint.phone ? complaint.phone.replace(/\D/g,'') : '447853169761'}" target="_blank"
                 class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl font-medium text-sm transition-all">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </a>
              ${complaint.phone ? `<a href="tel:${complaint.phone}" class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-medium text-sm transition-all"><i class="fa-solid fa-phone"></i> Call</a>` : ''}
            </div>

            <!-- Status Actions -->
            <div class="flex gap-3 pt-5 border-t border-zinc-800">
              <button onclick="updateStatus('${complaint.id}', 'In Progress')"
                      class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all text-sm">
                <i class="fa-solid fa-spinner mr-2"></i>In Progress
              </button>
              <button onclick="updateStatus('${complaint.id}', 'Resolved')"
                      class="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition-all text-sm">
                <i class="fa-solid fa-check mr-2"></i>Resolved
              </button>
              <button onclick="deleteComplaint('${complaint.id}')"
                      class="px-4 py-3 bg-red-700 hover:bg-red-600 rounded-xl font-semibold transition-all text-sm">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      });
    } else {
      html = `
        <div class="col-span-2 bg-zinc-900 rounded-3xl p-16 text-center border border-zinc-800">
          <i class="fa-solid fa-inbox text-6xl text-zinc-700 mb-6"></i>
          <p class="text-zinc-400 text-2xl font-semibold mb-2">No support requests yet</p>
          <p class="text-zinc-600">New submissions will appear here automatically</p>
        </div>
      `;
    }

    document.getElementById("complaintsList").innerHTML = html;
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

async function updateStatus(id, newStatus) {
  try {
    let { error } = await client.from("complaints").update({ status: newStatus }).eq("id", id);
    if (!error) {
      loadComplaints();
    } else {
      alert("Error updating status: " + error.message);
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteComplaint(id) {
  if (confirm("Are you sure you want to delete this ticket?")) {
    try {
      let { error } = await client.from("complaints").delete().eq("id", id);
      if (!error) {
        loadComplaints();
      } else {
        alert("Error deleting ticket: " + error.message);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fa-solid fa-check text-green-400 text-lg"></i>';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-copy text-lg"></i>';
    }, 1500);
  });
}
