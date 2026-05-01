import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import ListingLocationMap from "./ListingLocationMap";
import { LanguageProvider } from "@/contexts/LanguageContext";

const renderWithLang = (ui: React.ReactElement) =>
  render(<LanguageProvider>{ui}</LanguageProvider>);

// --- Mock react-leaflet (avoid rendering real map / requiring DOM measurements) ---
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Circle: () => null,
}));

vi.mock("leaflet", () => ({
  default: {
    Icon: { Default: { prototype: {}, mergeOptions: () => {} } },
  },
}));

// --- Mock supabase client and capture update chain calls ---
const updateSpy = vi.fn();
const eqSpy = vi.fn();
const isSpy = vi.fn();

vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        update: (...args: unknown[]) => {
          updateSpy(...args);
          return {
            eq: (...eqArgs: unknown[]) => {
              eqSpy(...eqArgs);
              return {
                is: (...isArgs: unknown[]) => {
                  isSpy(...isArgs);
                  return {
                    then: (cb: (r: { error: null }) => void) => {
                      cb({ error: null });
                      return Promise.resolve({ error: null });
                    },
                  };
                },
              };
            },
          };
        },
      })),
    },
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const mockNominatimSuccess = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      {
        lat: "33.5138",
        lon: "36.2765",
        addresstype: "city",
        type: "city",
      },
    ],
  });

describe("ListingLocationMap — coordinate persistence", () => {
  beforeEach(() => {
    updateSpy.mockClear();
    eqSpy.mockClear();
    isSpy.mockClear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("persists coordinates to DB after a successful Nominatim lookup", async () => {
    vi.stubGlobal("fetch", mockNominatimSuccess());

    render(
      <ListingLocationMap
        listingId="listing-123"
        city="دمشق"
        country="سوريا"
        latitude={null}
        longitude={null}
      />
    );

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });

    // update payload should contain numeric lat/lon
    const payload = updateSpy.mock.calls[0][0] as { latitude: number; longitude: number };
    expect(payload.latitude).toBeCloseTo(33.5138, 4);
    expect(payload.longitude).toBeCloseTo(36.2765, 4);

    // scoped to the right listing and only when latitude is null
    expect(eqSpy).toHaveBeenCalledWith("id", "listing-123");
    expect(isSpy).toHaveBeenCalledWith("latitude", null);
  });

  it("does NOT call DB update when listing already has saved coordinates", async () => {
    const fetchSpy = mockNominatimSuccess();
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <ListingLocationMap
        listingId="listing-123"
        city="دمشق"
        country="سوريا"
        latitude={33.5}
        longitude={36.3}
      />
    );

    // Give effects a tick
    await new Promise((r) => setTimeout(r, 50));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("does NOT call DB update when no listingId is provided", async () => {
    vi.stubGlobal("fetch", mockNominatimSuccess());

    render(<ListingLocationMap city="دمشق" country="سوريا" latitude={null} longitude={null} />);

    await waitFor(() => {
      // Wait for fetch resolution to flush
      expect(sessionStorage.getItem("geocode:دمشق, سوريا")).not.toBeNull();
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("does NOT persist when Nominatim returns no results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
    );

    render(
      <ListingLocationMap
        listingId="listing-456"
        city="UnknownPlace"
        country="Nowhere"
        latitude={null}
        longitude={null}
      />
    );

    await new Promise((r) => setTimeout(r, 50));

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("does NOT persist when the geocoding request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    render(
      <ListingLocationMap
        listingId="listing-789"
        city="دمشق"
        country="سوريا"
        latitude={null}
        longitude={null}
      />
    );

    await new Promise((r) => setTimeout(r, 50));

    expect(updateSpy).not.toHaveBeenCalled();
  });
});
