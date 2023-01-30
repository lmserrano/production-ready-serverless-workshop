# Future Improvement Considerations

- Implement tests relying on EventBridge instead of SQS
  - This allows for having the events pushed to the tests instead of SQS polling and eventual concurrency issues
- Implement workflows within the same bounded context as Step Functions
