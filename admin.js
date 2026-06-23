function login() {
  const pass = document.getElementById("pass").value;
  if (pass === "Yasin254") {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadComplaints();
  } else {
    alert("Wrong password");
  }
}

async function loadComplaints() {
  let { data } = await client.from("complaints").select("*").order("created_at", { ascending: false });

  let html = "";
  if (data && data.length > 0) {
    data.forEach(c => {
      const createdAt = new Date(c.created_at).toLocaleString();
      html += `
        <div class="card">
          <p><b>Reference: ${c.reference_number}</b></p>
          <p><b>Name:</b> ${c.full_name}</p>
          <p><b>Email:</b> ${c.email}</p>
          <p><b>Phone:</b> ${c.phone}</p>
          <p><b>Company:</b> ${c.company || "N/A"}</p>
          <p><b>Category:</b> ${c.category}</p>
          <p><b>Message:</b> ${c.message}</p>
          <p><b>Status:</b> <span class="status ${c.status.toLowerCase()}">${c.status}</span></p>
          <p><b>Submitted:</b> ${createdAt}</p>
          <div class="actions">
            <button onclick="updateStatus('${c.id}', 'In Progress')">In Progress</button>
            <button onclick="updateStatus('${c.id}', 'Resolved')">Resolved</button>
          </div>
        </div>
      `;
    });
  } else {
    html = "<p>No complaints yet</p>";
  }

  document.getElementById("list").innerHTML = html;
}

async function updateStatus(id, newStatus) {
  let { error } = await client.from("complaints").update({ status: newStatus }).eq("id", id);
  if (!error) {
    loadComplaints();
  } else {
    alert("Error updating status");
  }
}

async function refreshComplaints() {
  loadComplaints();
}