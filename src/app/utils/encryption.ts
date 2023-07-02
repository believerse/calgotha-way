export async function encryptData(
  data: Uint8Array,
  password: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const encodedPassword = encoder.encode(password);

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encodedPassword,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  );

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    derivedKey,
    data,
  );

  const encryptedBytes = new Uint8Array(encryptedData);

  const encryptedDataWithMeta = new Uint8Array(
    salt.length + iv.length + encryptedBytes.length,
  );
  encryptedDataWithMeta.set(salt, 0);
  encryptedDataWithMeta.set(iv, salt.length);
  encryptedDataWithMeta.set(encryptedBytes, salt.length + iv.length);

  return btoa(
    String.fromCharCode.apply(null, Array.from(encryptedDataWithMeta)),
  );
}

export async function decryptData(
  encryptedData: string,
  password: string,
): Promise<Uint8Array | null> {
  const encoder = new TextEncoder();
  const encodedPassword = encoder.encode(password);

  const encryptedDataWithMeta = new Uint8Array(
    Array.from(atob(encryptedData)).map((char) => char.charCodeAt(0)),
  );

  const salt = encryptedDataWithMeta.slice(0, 16);
  const iv = encryptedDataWithMeta.slice(16, 28);
  const encryptedBytes = encryptedDataWithMeta.slice(28);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encodedPassword,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );

  try {
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      derivedKey,
      encryptedBytes,
    );

    return new Uint8Array(decryptedData);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
}
