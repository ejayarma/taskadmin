const http = require('http');

const API = 'http://localhost:8080/api/tasks';
let pass = 0;
let fail = 0;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(data) });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(condition, testName) {
  if (condition) {
    console.log(`PASS: ${testName}`);
    pass++;
  } else {
    console.log(`FAIL: ${testName}`);
    fail++;
  }
}

async function run() {
  // Clean slate
  await request('DELETE', `${API}/1`).catch(() => {});
  await request('DELETE', `${API}/2`).catch(() => {});
  await request('DELETE', `${API}/3`).catch(() => {});

  // CREATE
  console.log('\n=== CREATE TASK ===');
  const created = await request('POST', API, {
    title: 'Test Task',
    description: 'A test task',
    start_date: '2026-07-24',
    due_date: '2026-07-30',
    category: 'office',
  });
  assert(created.status === 201, 'Create task returns 201');
  assert(created.body.title === 'Test Task', 'Create task has correct title');
  assert(created.body.category === 'office', 'Create task has correct category');
  const taskId = created.body.id;
  console.log(`  Created task ID: ${taskId}`);

  console.log('\n=== CREATE SECOND TASK ===');
  const created2 = await request('POST', API, {
    title: 'Second Task',
    description: 'Another task',
    category: 'personal',
  });
  assert(created2.status === 201, 'Create second task returns 201');
  const taskId2 = created2.body.id;
  console.log(`  Created task ID: ${taskId2}`);

  console.log('\n=== CREATE WITHOUT TITLE (should fail) ===');
  const noTitle = await request('POST', API, { description: 'No title' });
  assert(noTitle.status === 400, 'Create without title returns 400');

  // READ
  console.log('\n=== GET ALL TASKS ===');
  const all = await request('GET', API);
  assert(all.status === 200, 'Get all tasks returns 200');
  assert(all.body.some((t) => t.title === 'Test Task'), 'Get all includes first task');
  assert(all.body.some((t) => t.title === 'Second Task'), 'Get all includes second task');

  console.log('\n=== GET SINGLE TASK ===');
  const single = await request('GET', `${API}/${taskId}`);
  assert(single.status === 200, 'Get single task returns 200');
  assert(single.body.title === 'Test Task', 'Get single task has correct title');
  assert(single.body.description === 'A test task', 'Get single task has description');

  console.log('\n=== GET NONEXISTENT TASK (should 404) ===');
  const missing = await request('GET', `${API}/99999`);
  assert(missing.status === 404, 'Get nonexistent task returns 404');

  // UPDATE
  console.log('\n=== UPDATE TASK (PUT) ===');
  const updated = await request('PUT', `${API}/${taskId}`, {
    title: 'Updated Task',
    completed: true,
  });
  assert(updated.status === 200, 'Update task returns 200');
  assert(updated.body.title === 'Updated Task', 'Update changes title');
  assert(updated.body.completed === true, 'Update sets completed');

  console.log('\n=== PATCH TASK ===');
  const patched = await request('PATCH', `${API}/${taskId2}`, {
    description: 'Patched description',
  });
  assert(patched.status === 200, 'Patch task returns 200');
  assert(patched.body.description === 'Patched description', 'Patch updates description');

  // DELETE
  console.log('\n=== DELETE TASK ===');
  const deleted = await request('DELETE', `${API}/${taskId}`);
  assert(deleted.status === 200, 'Delete task returns 200');
  assert(deleted.body.message === 'Task deleted', 'Delete returns success message');

  console.log('\n=== DELETE NONEXISTENT TASK (should 404) ===');
  const delMissing = await request('DELETE', `${API}/99999`);
  assert(delMissing.status === 404, 'Delete nonexistent task returns 404');

  console.log('\n=== VERIFY DELETION ===');
  const afterDelete = await request('GET', API);
  assert(afterDelete.status === 200, 'Get all after delete returns 200');
  assert(!afterDelete.body.some((t) => t.title === 'Updated Task'), 'Deleted task no longer in list');

  // Cleanup
  await request('DELETE', `${API}/${taskId2}`).catch(() => {});

  console.log('\n==============================');
  console.log(`RESULTS: ${pass} passed, ${fail} failed`);
  console.log('==============================');

  process.exit(fail > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
