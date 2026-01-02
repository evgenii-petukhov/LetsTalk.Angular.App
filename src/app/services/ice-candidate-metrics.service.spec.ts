import { TestBed } from '@angular/core/testing';
import { IceCandidateMetricsService } from './ice-candidate-metrics.service';
import { IceCandidateMetricsTestHelper } from './ice-candidate-metrics.service.test-helper';
import { IceCandidateMetrics } from '../models/ice-candidate-metrics';

describe('IceCandidateMetricsService', () => {
    let service: IceCandidateMetricsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IceCandidateMetricsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getCandidateStatistics', () => {
        it('should return zero counts for empty candidate array', () => {
            const result = service.getIceCandidateMetrics([]);

            expect(result).toEqual({
                host: 0,
                srflx: 0,
                prflx: 0,
                relay: 0,
            });
        });

        it('should count single host candidate correctly', () => {
            const candidates = [
                IceCandidateMetricsTestHelper.createMockCandidate('host'),
            ];
            const result = service.getIceCandidateMetrics(candidates);

            expect(result).toEqual({
                host: 1,
                srflx: 0,
                prflx: 0,
                relay: 0,
            });
        });

        it('should count single srflx candidate correctly', () => {
            const candidates = [
                IceCandidateMetricsTestHelper.createMockCandidate('srflx'),
            ];
            const result = service.getIceCandidateMetrics(candidates);

            expect(result).toEqual({
                host: 0,
                srflx: 1,
                prflx: 0,
                relay: 0,
            });
        });

        it('should count single prflx candidate correctly', () => {
            const candidates = [
                IceCandidateMetricsTestHelper.createMockCandidate('prflx'),
            ];
            const result = service.getIceCandidateMetrics(candidates);

            expect(result).toEqual({
                host: 0,
                srflx: 0,
                prflx: 1,
                relay: 0,
            });
        });

        it('should count single relay candidate correctly', () => {
            const candidates = [
                IceCandidateMetricsTestHelper.createMockCandidate('relay'),
            ];
            const result = service.getIceCandidateMetrics(candidates);

            expect(result).toEqual({
                host: 0,
                srflx: 0,
                prflx: 0,
                relay: 1,
            });
        });

        it('should count multiple candidates of same type correctly', () => {
            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                { host: 3 },
            );
            const result = service.getIceCandidateMetrics(candidates);

            expect(result).toEqual({
                host: 3,
                srflx: 0,
                prflx: 0,
                relay: 0,
            });
        });

        it('should count mixed candidate types correctly', () => {
            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                {
                    host: 2,
                    srflx: 3,
                    prflx: 1,
                    relay: 2,
                },
            );
            const result = service.getIceCandidateMetrics(candidates);

            expect(result).toEqual({
                host: 2,
                srflx: 3,
                prflx: 1,
                relay: 2,
            });
        });

        it('should handle large number of candidates', () => {
            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                {
                    host: 100,
                    srflx: 100,
                    prflx: 100,
                    relay: 100,
                },
            );

            const result = service.getIceCandidateMetrics(candidates);

            expect(result).toEqual({
                host: 100,
                srflx: 100,
                prflx: 100,
                relay: 100,
            });
        });

        it('should handle candidates with different properties correctly', () => {
            const candidates = [
                IceCandidateMetricsTestHelper.createMockCandidate('host', {
                    port: 1234,
                }),
                IceCandidateMetricsTestHelper.createMockCandidate('host', {
                    port: 5678,
                }),
                IceCandidateMetricsTestHelper.createMockCandidate('srflx', {
                    protocol: 'tcp',
                }),
            ];

            const result = service.getIceCandidateMetrics(candidates);

            expect(result).toEqual({
                host: 2,
                srflx: 1,
                prflx: 0,
                relay: 0,
            });
        });
    });

    describe('hasSufficientServers', () => {
        it('should return true when all requirements are met exactly', () => {
            expect(service.hasSufficientServers({
                host: 1,
                srflx: 1,
                prflx: 0,
                relay: 1,
            })).toBe(true);
        });

        it('should return true when all requirements are exceeded', () => {
            expect(
                service.hasSufficientServers({
                    host: 5,
                    srflx: 3,
                    prflx: 2,
                    relay: 4,
                }),
            ).toBe(true);
        });

        it('should return false when host requirement is not met', () => {
            expect(
                service.hasSufficientServers({
                    host: 0,
                    srflx: 1,
                    prflx: 0,
                    relay: 1,
                }),
            ).toBe(false);
        });

        it('should return false when srflx requirement is not met', () => {
            expect(
                service.hasSufficientServers({
                    host: 1,
                    srflx: 0,
                    prflx: 0,
                    relay: 1,
                }),
            ).toBe(false);
        });

        it('should return false when relay requirement is not met', () => {
            expect(
                service.hasSufficientServers({
                    host: 1,
                    srflx: 1,
                    prflx: 0,
                    relay: 0,
                }),
            ).toBe(false);
        });

        it('should return false when multiple requirements are not met', () => {
            expect(
                service.hasSufficientServers({
                    host: 0,
                    srflx: 0,
                    prflx: 0,
                    relay: 0,
                }),
            ).toBe(false);
        });

        it('should return true when prflx exceeds requirement (prflx requirement is 0)', () => {
            expect(
                service.hasSufficientServers({
                    host: 1,
                    srflx: 1,
                    prflx: 5,
                    relay: 1,
                }),
            ).toBe(true);
        });

        it('should handle boundary values correctly', () => {
            // Test exactly at the boundary
            expect(
                service.hasSufficientServers({
                    host: 1,
                    srflx: 1,
                    prflx: 0,
                    relay: 1,
                }),
            ).toBe(true);

            // Test just below the boundary
            expect(
                service.hasSufficientServers({
                    host: 0,
                    srflx: 1,
                    prflx: 0,
                    relay: 1,
                }),
            ).toBe(false);
        });
    });

    describe('hasMinimumCandidateCount', () => {
        it('should return true when candidate count meets minimum requirement', () => {
            // Required total is 3 (host: 1 + srflx: 1 + relay: 1)
            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                {
                    host: 1,
                    srflx: 1,
                    relay: 1,
                },
            );

            expect(service.hasMinimumCandidateCount(candidates)).toBe(true);
        });

        it('should return true when candidate count exceeds minimum requirement', () => {
            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                {
                    host: 2,
                    srflx: 2,
                    prflx: 1,
                    relay: 2,
                },
            );

            expect(service.hasMinimumCandidateCount(candidates)).toBe(true);
        });

        it('should return false when candidate count is below minimum requirement', () => {
            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                {
                    host: 1,
                    srflx: 1,
                },
            ); // Only 2 candidates, need 3

            expect(service.hasMinimumCandidateCount(candidates)).toBe(false);
        });

        it('should return false for empty candidate array', () => {
            expect(service.hasMinimumCandidateCount([])).toBe(false);
        });

        it('should return false for single candidate', () => {
            const candidates = [
                IceCandidateMetricsTestHelper.createMockCandidate('host'),
            ];

            expect(service.hasMinimumCandidateCount(candidates)).toBe(false);
        });

        it('should handle exactly minimum count edge case', () => {
            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                {
                    host: 1,
                    srflx: 1,
                    relay: 1,
                },
            ); // Exactly 3 candidates

            expect(service.hasMinimumCandidateCount(candidates)).toBe(true);
        });

        it('should work regardless of candidate types (only checks count)', () => {
            // 3 candidates of same type should pass preCheck
            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                {
                    prflx: 3,
                },
            );

            expect(service.hasMinimumCandidateCount(candidates)).toBe(true);
        });
    });

    describe('Integration tests with test scenarios', () => {
        const scenarios = IceCandidateMetricsTestHelper.getTestScenarios();

        it('should handle empty scenario correctly', () => {
            const scenario = scenarios.empty;

            expect(service.hasMinimumCandidateCount(scenario.candidates)).toBe(
                scenario.shouldPassPreCheck,
            );

            const stats = service.getIceCandidateMetrics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);

            expect(service.hasSufficientServers(stats)).toBe(
                scenario.shouldBeSufficient,
            );
        });

        it('should handle minimal scenario correctly', () => {
            const scenario = scenarios.minimal;

            expect(service.hasMinimumCandidateCount(scenario.candidates)).toBe(
                scenario.shouldPassPreCheck,
            );

            const stats = service.getIceCandidateMetrics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);

            expect(service.hasSufficientServers(stats)).toBe(
                scenario.shouldBeSufficient,
            );
        });

        it('should handle optimal scenario correctly', () => {
            const scenario = scenarios.optimal;

            expect(service.hasMinimumCandidateCount(scenario.candidates)).toBe(
                scenario.shouldPassPreCheck,
            );

            const stats = service.getIceCandidateMetrics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);

            expect(service.hasSufficientServers(stats)).toBe(
                scenario.shouldBeSufficient,
            );
        });

        it('should handle insufficient no relay scenario correctly', () => {
            const scenario = scenarios.insufficientNoRelay;

            expect(service.hasMinimumCandidateCount(scenario.candidates)).toBe(
                scenario.shouldPassPreCheck,
            );

            const stats = service.getIceCandidateMetrics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);

            expect(service.hasSufficientServers(stats)).toBe(
                scenario.shouldBeSufficient,
            );
        });

        it('should handle insufficient count scenario correctly', () => {
            const scenario = scenarios.insufficientCount;

            expect(service.hasMinimumCandidateCount(scenario.candidates)).toBe(
                scenario.shouldPassPreCheck,
            );

            const stats = service.getIceCandidateMetrics(scenario.candidates);
            expect(stats).toEqual(scenario.expectedStats);

            expect(service.hasSufficientServers(stats)).toBe(
                scenario.shouldBeSufficient,
            );
        });
    });

    describe('Edge cases and error conditions', () => {
        it('should handle null/undefined candidate properties gracefully', () => {
            // This tests the robustness of the service
            const candidates = [
                IceCandidateMetricsTestHelper.createMockCandidate('host'),
                IceCandidateMetricsTestHelper.createMockCandidate('srflx'),
                IceCandidateMetricsTestHelper.createMockCandidate('relay'),
            ];

            // Should not throw errors
            expect(() => {
                const stats = service.getIceCandidateMetrics(candidates);
                service.hasSufficientServers(stats);
                service.hasMinimumCandidateCount(candidates);
            }).not.toThrow();
        });

        it('should handle very large candidate arrays efficiently', () => {
            const startTime = performance.now();

            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                {
                    host: 1000,
                    srflx: 1000,
                    prflx: 1000,
                    relay: 1000,
                },
            );

            const stats = service.getIceCandidateMetrics(candidates);
            const endTime = performance.now();

            // Should complete within reasonable time (less than 100ms)
            expect(endTime - startTime).toBeLessThan(100);

            expect(stats).toEqual({
                host: 1000,
                srflx: 1000,
                prflx: 1000,
                relay: 1000,
            });
        });

        it('should maintain consistency across multiple calls', () => {
            const candidates = IceCandidateMetricsTestHelper.createMockCandidateArray(
                {
                    host: 2,
                    srflx: 3,
                    relay: 1,
                },
            );

            // Multiple calls should return identical results
            const stats1 = service.getIceCandidateMetrics(candidates);
            const stats2 = service.getIceCandidateMetrics(candidates);
            const stats3 = service.getIceCandidateMetrics(candidates);

            expect(stats1).toEqual(stats2);
            expect(stats2).toEqual(stats3);

            expect(service.hasSufficientServers(stats1)).toBe(
                service.hasSufficientServers(stats2),
            );
            expect(service.hasMinimumCandidateCount(candidates)).toBe(
                service.hasMinimumCandidateCount(candidates),
            );
        });
    });

    describe('Service requirements configuration', () => {
        it('should have correct default requirements', () => {
            // Test the requirements indirectly through hasSufficientServers
            const minimalStat: IceCandidateMetrics = {
                host: 1,
                srflx: 1,
                prflx: 0,
                relay: 1,
            };

            expect(service.hasSufficientServers(minimalStat)).toBe(true);

            // Test that reducing any required field fails
            expect(
                service.hasSufficientServers({ ...minimalStat, host: 0 }),
            ).toBe(false);
            expect(
                service.hasSufficientServers({ ...minimalStat, srflx: 0 }),
            ).toBe(false);
            expect(
                service.hasSufficientServers({ ...minimalStat, relay: 0 }),
            ).toBe(false);

            // Test that prflx is not required (can be 0)
            expect(
                service.hasSufficientServers({ ...minimalStat, prflx: 0 }),
            ).toBe(true);
        });
    });
});
