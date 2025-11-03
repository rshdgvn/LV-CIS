import { APP_URL } from "@/lib/config";

let createInProgress = false; // Prevents multiple clicks
let lastCreateTime = null;

const LIMIT_MS = 5000; // 5-second cooldown before another create request

export const EventService = {
  async createEvent(form, token) {
    if (createInProgress) {
      throw new Error("A create request is already in progress. Please wait.");
    }

    if (lastCreateTime && Date.now() - lastCreateTime < LIMIT_MS) {
      throw new Error(
        "You’re creating events too quickly. Please wait a few seconds."
      );
    }

    createInProgress = true;
    lastCreateTime = Date.now();

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "photos" || key === "videos") {
          value.forEach((file) => formData.append(`${key}[]`, file));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      const res = await fetch(`${APP_URL}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create event.");
      }

      return data;
    } finally {
      createInProgress = false;
    }
  },

  async updateEvent(id, form, token) {
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      const value = form[key];
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => formData.append(`${key}[${i}]`, item));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    console.log('formData', formData)

    const res = await fetch(`${APP_URL}/events/${id}`, {
      method: "PATCH", 
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to update event");
    return await res.json();
  },
};
