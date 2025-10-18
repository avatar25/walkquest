import Foundation

public struct FetchTodaysQuests {
    private let questRepository: QuestRepository
    
    public init(questRepository: QuestRepository) {
        self.questRepository = questRepository
    }
    
    public func execute() async throws -> [Quest] {
        return try await questRepository.todaysQuests()
    }
}
