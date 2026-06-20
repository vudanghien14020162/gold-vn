export function mockRequest(data, delay = 300) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        response_object: data,
      });
    }, delay);
  });
}