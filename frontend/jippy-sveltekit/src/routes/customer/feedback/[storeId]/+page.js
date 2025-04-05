export const prerender = false;

export function load({ params }) {
  return {
    storeId: params.storeId,
  };
}
