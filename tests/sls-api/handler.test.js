test("correct default node_env", () => {
  expect(process.env.NODE_ENV).toBe("test");
});
