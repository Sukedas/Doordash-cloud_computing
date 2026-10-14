# DoorDash — Cloud-Native Food Delivery Platform

Course project for **Cloud Computing, Semester 2026-III** — Universidad Distrital Francisco José de Caldas
(Eng. Carlos Andrés Sierra, M.Sc.).

**Team 2** designs a scalable, resilient, cloud-native architecture for a DoorDash-style food delivery
platform, focused on **Order Management, Route Optimization & Notifications**.

| Member |
|---|
| Daniel Felipe Barrera Suárez |
| Jaider Camilo Carvajal Marín |
| Nelson David Posso Suárez |
| Edward Julián García Gaitán |
| Julián David Cabrera Barragán |

## Assigned workload

- 50,000+ concurrent orders during peak hours, 1,000+ restaurants, complex routing
- Order state machines, route optimization, merchant integration, real-time delivery tracking
- 99.9 % availability, eventual consistency for order status, time-based SLAs (delivery windows)
- Challenges: multi-region orchestration, merchant API rate limits, delivery driver state

## Project status

| Delivery | Topic | Status | Document |
|---|---|---|---|
| 1 | Requirements & Workload Model | Done | [group2_delivery1.pdf](Delivery_1/group2_delivery1.pdf) |
| 2 | Software Architecture | Done | [group2_delivery2.pdf](Delivery_2/group2_delivery2.pdf) |
| 3 | Cloud Architecture & Scalability | Pending | — |
| 4 | Prototype, Resilience & Final Architecture | Pending | — |

Key results so far:

- **Delivery 1** — 10 use cases, 12 functional requirements (FR-01 – FR-12), 19 non-functional
  requirements (NFR-01 – NFR-19) and a workload model: 75,000 orders/hour and 51.6 M requests/hour at
  peak (36 M of them Dasher location reports), 185,000 concurrent users, ≈ 8.5 TB at launch growing
  ≈ 54 TB/year. Every value is derived from public DoorDash data (SEC filings, engineering blog).
- **Delivery 2** — C4 context diagram, 15 services with APIs, data ownership and scaling
  characteristics, polyglot data architecture, sync/async communication matrix, 10 ADRs and full
  FR → service traceability. Cloud-independent by design.

## Repository structure

```
.
├── README.md
├── TeamsDistribution.pdf          # course team assignment
├── Delivery_1/
│   ├── Delivery_1.pdf             # assignment statement
│   ├── group2_delivery1.pdf       # our Requirements & Workload Specification
│   ├── src/group2_delivery1.md    # report source (Markdown)
│   └── diagrams/                  # Graphviz sources (.dot) + rendered .svg
├── Delivery_2/
│   ├── Delivery_2.pdf             # assignment statement
│   ├── group2_delivery2.pdf       # our Software Architecture Document
│   ├── src/group2_delivery2.md    # report source (Markdown)
│   └── diagrams/                  # .dot sources, hand-authored service_architecture.svg
├── Delivery_3/                    # cloud architecture (future)
├── Delivery_4/                    # prototype, resilience report, final architecture (future)
├── Prototype/                     # AWS Academy / LocalStack vertical slice (future)
└── tools/                         # build scripts for the PDFs
```

## Building the documents

Requirements: Node.js 18+ and Microsoft Edge or Google Chrome (used headless to print PDFs).

```sh
cd tools
npm install
npm run build              # both deliveries
npm run build -- delivery_2   # just one
```

The build renders every `diagrams/*.dot` file to SVG, converts the Markdown report to HTML with
`tools/report.css`, and prints it to `groupN_deliveryN.pdf`. Set `CHROME_PATH` if the browser is not
in a standard location.
