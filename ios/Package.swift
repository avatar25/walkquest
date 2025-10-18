// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "WalkQuest",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "WalkQuestDomain",
            targets: ["WalkQuestDomain"]
        ),
        .library(
            name: "WalkQuestData",
            targets: ["WalkQuestData"]
        ),
        .library(
            name: "WalkQuestFeatures",
            targets: ["WalkQuestFeatures"]
        ),
        .library(
            name: "WalkQuestShared",
            targets: ["WalkQuestShared"]
        )
    ],
    dependencies: [
        // External dependencies will be added here as needed
    ],
    targets: [
        // Domain layer - pure Swift types and protocols
        .target(
            name: "WalkQuestDomain",
            dependencies: [],
            path: "Sources/Domain"
        ),
        
        // Data layer - repositories, API clients, services
        .target(
            name: "WalkQuestData",
            dependencies: ["WalkQuestDomain", "WalkQuestShared"],
            path: "Sources/Data"
        ),
        
        // Features layer - ViewModels and Views
        .target(
            name: "WalkQuestFeatures",
            dependencies: ["WalkQuestDomain", "WalkQuestData", "WalkQuestShared"],
            path: "Sources/Features"
        ),
        
        // Shared layer - networking, design system, utilities
        .target(
            name: "WalkQuestShared",
            dependencies: [],
            path: "Sources/Shared"
        ),
        
        // Test targets
        .testTarget(
            name: "WalkQuestDomainTests",
            dependencies: ["WalkQuestDomain"],
            path: "Tests/Domain"
        ),
        .testTarget(
            name: "WalkQuestDataTests",
            dependencies: ["WalkQuestData"],
            path: "Tests/Data"
        )
    ]
)
