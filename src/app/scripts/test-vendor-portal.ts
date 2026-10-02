/*
 * Script test untuk vendor-portal feature.
 *
 * Cara pakai:
 *   1. Dapatkan token vendor: POST /auth/login (login sebagai user vendor)
 *   2. Dapatkan vendor_id dari response token (users.id, karena vendor_registration.user_id = users.id setelah approval)
 *   3. Update stage via POST /vendor-portal/{vendorId}/stage
 *   4. UI di FE akan auto-update via WebSocket
 *
 * Simulasi via curl:
 *   TOKEN=$(curl -X POST $API/auth/login -d '{"username":"vendor1","password":"xxx"}' | jq -r .access_token)
 *   VENDOR_ID=1
 *   curl -X POST $API/vendor-portal/$VENDOR_ID/stage \
 *     -H "Content-Type: application/json" \
 *     -d '{"stage":"review_admin","stage_note":"Sedang direview"}'
 */
export {};
async function main() {
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  const stage = process.env.STAGE || 'review_admin';
  const stageNote = process.env.NOTE || 'Sedang direview tim Mitra10';

  if (!username || !password) {
    console.log(
      'Usage: API_URL=... USERNAME=... PASSWORD=... STAGE=... NOTE=... ts-node scripts/test-vendor-portal.ts',
    );
    return;
  }

  // 1. Login
  const loginRes = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!loginRes.ok) {
    console.error('Login failed', loginRes.status, await loginRes.text());
    return;
  }
  const loginBody = await loginRes.json();
  const token = loginBody.access_token ?? loginBody.token;
  console.log('Token acquired.');

  // 2. Get current user info
  const meRes = await fetch(`${apiUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meBody = await meRes.json();
  const userId = meBody.id ?? meBody.user_id;
  console.log('User id:', userId);

  // 3. Find vendor_registration via user_id
  // We need to look up vendor_registration where user_id = current user id
  // For now, assume vendorId is passed via env
  const vendorId = process.env.VENDOR_ID ? parseInt(process.env.VENDOR_ID) : userId;
  console.log('Vendor id:', vendorId);

  // 4. Update stage
  const updateRes = await fetch(`${apiUrl}/vendor-portal/${vendorId}/stage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ stage, stage_note: stageNote }),
  });
  const updateBody = await updateRes.json();
  console.log('Update response:', JSON.stringify(updateBody, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
