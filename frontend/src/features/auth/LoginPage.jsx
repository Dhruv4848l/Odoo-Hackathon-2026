import React, { useState } from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-neutral-surface p-8 rounded-lg shadow-card border border-neutral-border">
        <h2 className="text-center text-3xl font-display font-semibold text-brand-primary">🌿 EcoSphere Sign In</h2>
        <form className="mt-8 space-y-6">
          <input className="block w-full p-2 border border-neutral-border rounded" placeholder="Username" type="text" />
          <input className="block w-full p-2 border border-neutral-border rounded" placeholder="Password" type="password" />
          <button className="w-full bg-brand-primary text-neutral-surface py-2 rounded hover:opacity-90 font-medium">Log in</button>
        </form>
      </div>
    </div>
  );
}
