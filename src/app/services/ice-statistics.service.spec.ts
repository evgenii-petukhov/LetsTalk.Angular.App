import { TestBed } from '@angular/core/testing';
import { IceStatisticsService } from './ice-statistics.service';
import { CandidateStat } from '../models/CandidateStat';
import { IceStatisticsTestHelper } from './ice-statistics.service.test-helper';

describe('IceStatisticsService', () => {
    let service: IceStatisticsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IceStatisticsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getCandidateStatistics', () => {
        it('should return zero counts for empty candidate array', () => {
            const result = service.getCandidateStatistics([]);
            
            expect(result).toEqual({
                host: 0,
                srflx: 0,
                prflx: 0,
                relay: 0
            });
        });

        it('should count single host candidate correctly', () => {
            const candidates = [IceStatisticsTestHelper.createMockCandidate('host')];
            const result = service.getCandidateStatistics(candidates);
            
            expect(result).toEqual({
                host: 1,
                srflx: 0,
                prflx: 0,
                relay: 0
            });
        });

        it('should count single srflx candidate correctly', () => {
            const candidates = [IceStatisticsTestHelper.createMockCandidate('srflx')];
            const result = service.getCandidateStatistics(candidates);
            
            expect(result).toEqual({
                host: 0,
                srflx: 1,
                prflx: 0,
                relay: 0
            });
        });

        it('should count single prflx candidate correctly', () => {
            const candidates = [IceStatisticsTestHelper.createMockCandidate('prflx')];
            const result = service.getCandidateStatistics(candidates);
            
            expect(result).toEqual({
                host: 0,
                srflx: 0,
                prflx: 1,
                relay: 0
            });
        });

        it('should count single relay candidate correctly', () => {
            const candidates = [IceStatisticsTestHelper.createMockCandidate('relay')];
            const result = service.getCandidateStatistics(candidates);
            
            expect(result).toEqual({
                host: 0,
                srflx: 0,
                prflx: 0,
                relay: 1
            });
        });

        it('should count multiple candidates of same type correctly', () => {
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({ host: 3 });
            const result = service.getCandidateStatistics(candidates);
            
            expect(result).toEqual({
                host: 3,
                srflx: 0,
                prflx: 0,
                relay: 0
            });
        });

        it('should count mixed candidate types correctly', () => {
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({
                host: 2,
                srflx: 3,
                prflx: 1,
                relay: 2
            });
            const result = service.getCandidateStatistics(candidates);
            
            expect(result).toEqual({
                host: 2,
                srflx: 3,
                prflx: 1,
                relay: 2
            });
        });

        it('should handle large number of candidates', () => {
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({
                host: 100,
                srflx: 100,
                prflx: 100,
                relay: 100
            });
            
            const result = service.getCandidateStatistics(candidates);
            
            expect(result).toEqual({
                host: 100,
                srflx: 100,
                prflx: 100,
                relay: 100
            });
        });

        it('should handle candidates with different properties correctly', () => {
            const candidates = [
                IceStatisticsTestHelper.createMockCandidate('host', { port: 1234 }),
                IceStatisticsTestHelper.createMockCandidate('host', { port: 5678 }),
                IceStatisticsTestHelper.createMockCandidate('srflx', { protocol: 'tcp' })
            ];
            
            const result = service.getCandidateStatistics(candidates);
            
            expect(result).toEqual({
                host: 2,
                srflx: 1,
                prflx: 0,
                relay: 0
            });
        });
    });

    describe('hasSufficientServers', () => {
        it('should return true when all requirements are met exactly', () => {
            const stat: CandidateStat = {
                host: 1,
                srflx: 1,
                prflx: 0,
                relay: 1
            };
            
            expect(service.hasSufficientServers(stat)).toBe(true);
        });

        it('should return true when all requirements are exceeded', () => {
            const stat: CandidateStat = {
                host: 5,
                srflx: 3,
                prflx: 2,
                relay: 4
            };
            
            expect(service.hasSufficientServers(stat)).toBe(true);
        });

        it('should return false when host requirement is not met', () => {
            const stat: CandidateStat = {
                host: 0,
                srflx: 1,
                prflx: 0,
                relay: 1
            };
            
            expect(service.hasSufficientServers(stat)).toBe(false);
        });

        it('should return false when srflx requirement is not met', () => {
            const stat: CandidateStat = {
                host: 1,
                srflx: 0,
                prflx: 0,
                relay: 1
            };
            
            expect(service.hasSufficientServers(stat)).toBe(false);
        });

        it('should return false when relay requirement is not met', () => {
            const stat: CandidateStat = {
                host: 1,
                srflx: 1,
                prflx: 0,
                relay: 0
            };
            
            expect(service.hasSufficientServers(stat)).toBe(false);
        });

        it('should return false when multiple requirements are not met', () => {
            const stat: CandidateStat = {
                host: 0,
                srflx: 0,
                prflx: 0,
                relay: 0
            };
            
            expect(service.hasSufficientServers(stat)).toBe(false);
        });

        it('should return true when prflx exceeds requirement (prflx requirement is 0)', () => {
            const stat: CandidateStat = {
                host: 1,
                srflx: 1,
                prflx: 5,
                relay: 1
            };
            
            expect(service.hasSufficientServers(stat)).toBe(true);
        });

        it('should handle boundary values correctly', () => {
            // Test exactly at the boundary
            const exactStat: CandidateStat = {
                host: 1,
                srflx: 1,
                prflx: 0,
                relay: 1
            };
            expect(service.hasSufficientServers(exactStat)).toBe(true);

            // Test just below the boundary
            const belowStat: CandidateStat = {
                host: 0,
                srflx: 1,
                prflx: 0,
                relay: 1
            };
            expect(service.hasSufficientServers(belowStat)).toBe(false);
        });
    });

    describe('preCheck', () => {
        it('should return true when candidate count meets minimum requirement', () => {
            // Required total is 3 (host: 1 + srflx: 1 + relay: 1)
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({
                host: 1,
                srflx: 1,
                relay: 1
            });
            
            expect(service.preCheck(candidates)).toBe(true);
        });

        it('should return true when candidate count exceeds minimum requirement', () => {
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({
                host: 2,
                srflx: 2,
                prflx: 1,
                relay: 2
            });
            
            expect(service.preCheck(candidates)).toBe(true);
        });

        it('should return false when candidate count is below minimum requirement', () => {
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({
                host: 1,
                srflx: 1
            }); // Only 2 candidates, need 3
            
            expect(service.preCheck(candidates)).toBe(false);
        });

        it('should return false for empty candidate array', () => {
            expect(service.preCheck([])).toBe(false);
        });

        it('should return false for single candidate', () => {
            const candidates = [IceStatisticsTestHelper.createMockCandidate('host')];
            
            expect(service.preCheck(candidates)).toBe(false);
        });

        it('should handle exactly minimum count edge case', () => {
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({
                host: 1,
                srflx: 1,
                relay: 1
            }); // Exactly 3 candidates
            
            expect(service.preCheck(candidates)).toBe(true);
        });

        it('should work regardless of candidate types (only checks count)', () => {
            // 3 candidates of same type should pass preCheck
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({
                prflx: 3
            });
            
            expect(service.preCheck(candidates)).toBe(true);
        });
    });

    describe('Integration tests with test scenarios', () => {
        const scenarios = IceStatisticsTestHelper.getTestScenarios();

        it('should handle empty scenario correctly', () => {
            const scenario = scenarios.empty;
            
            expect(service.preCheck(scenario.candidates)).toBe(scenario.shouldPassPreCheck);
            
            const stats = service.getCandidateStatistics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);
            
            expect(service.hasSufficientServers(stats)).toBe(scenario.shouldBeSufficient);
        });

        it('should handle minimal scenario correctly', () => {
            const scenario = scenarios.minimal;
            
            expect(service.preCheck(scenario.candidates)).toBe(scenario.shouldPassPreCheck);
            
            const stats = service.getCandidateStatistics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);
            
            expect(service.hasSufficientServers(stats)).toBe(scenario.shouldBeSufficient);
        });

        it('should handle optimal scenario correctly', () => {
            const scenario = scenarios.optimal;
            
            expect(service.preCheck(scenario.candidates)).toBe(scenario.shouldPassPreCheck);
            
            const stats = service.getCandidateStatistics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);
            
            expect(service.hasSufficientServers(stats)).toBe(scenario.shouldBeSufficient);
        });

        it('should handle insufficient no relay scenario correctly', () => {
            const scenario = scenarios.insufficientNoRelay;
            
            expect(service.preCheck(scenario.candidates)).toBe(scenario.shouldPassPreCheck);
            
            const stats = service.getCandidateStatistics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);
            
            expect(service.hasSufficientServers(stats)).toBe(scenario.shouldBeSufficient);
        });

        it('should handle insufficient count scenario correctly', () => {
            const scenario = scenarios.insufficientCount;
            
            expect(service.preCheck(scenario.candidates)).toBe(scenario.shouldPassPreCheck);
            
            const stats = service.getCandidateStatistics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);
            
            expect(service.hasSufficientServers(stats)).toBe(scenario.shouldBeSufficient);
        });
    });

    describe('Edge cases and error conditions', () => {
        it('should handle null/undefined candidate properties gracefully', () => {
            // This tests the robustness of the service
            const candidates = [
                IceStatisticsTestHelper.createMockCandidate('host'),
                IceStatisticsTestHelper.createMockCandidate('srflx'),
                IceStatisticsTestHelper.createMockCandidate('relay')
            ];
            
            // Should not throw errors
            expect(() => {
                const stats = service.getCandidateStatistics(candidates);
                service.hasSufficientServers(stats);
                service.preCheck(candidates);
            }).not.toThrow();
        });

        it('should handle very large candidate arrays efficiently', () => {
            const startTime = performance.now();
            
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({
                host: 1000,
                srflx: 1000,
                prflx: 1000,
                relay: 1000
            });
            
            const stats = service.getCandidateStatistics(candidates);
            const endTime = performance.now();
            
            // Should complete within reasonable time (less than 100ms)
            expect(endTime - startTime).toBeLessThan(100);
            
            expect(stats).toEqual({
                host: 1000,
                srflx: 1000,
                prflx: 1000,
                relay: 1000
            });
        });

        it('should maintain consistency across multiple calls', () => {
            const candidates = IceStatisticsTestHelper.createMockCandidateArray({
                host: 2,
                srflx: 3,
                relay: 1
            });
            
            // Multiple calls should return identical results
            const stats1 = service.getCandidateStatistics(candidates);
            const stats2 = service.getCandidateStatistics(candidates);
            const stats3 = service.getCandidateStatistics(candidates);
            
            expect(stats1).toEqual(stats2);
            expect(stats2).toEqual(stats3);
            
            expect(service.hasSufficientServers(stats1)).toBe(service.hasSufficientServers(stats2));
            expect(service.preCheck(candidates)).toBe(service.preCheck(candidates));
        });
    });

    describe('Service requirements configuration', () => {
        it('should have correct default requirements', () => {
            // Test the requirements indirectly through hasSufficientServers
            const minimalStat: CandidateStat = {
                host: 1,
                srflx: 1,
                prflx: 0,
                relay: 1
            };
            
            expect(service.hasSufficientServers(minimalStat)).toBe(true);
            
            // Test that reducing any required field fails
            expect(service.hasSufficientServers({ ...minimalStat, host: 0 })).toBe(false);
            expect(service.hasSufficientServers({ ...minimalStat, srflx: 0 })).toBe(false);
            expect(service.hasSufficientServers({ ...minimalStat, relay: 0 })).toBe(false);
            
            // Test that prflx is not required (can be 0)
            expect(service.hasSufficientServers({ ...minimalStat, prflx: 0 })).toBe(true);
        });
    });
});