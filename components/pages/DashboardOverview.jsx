'use client';

import React from 'react';
import {
    Users,
    Stethoscope,
    Building,
    Calendar,
    ArrowUpRight,
    Activity,
    Clock,
    CheckCircle,
    Shield,
    TrendingUp,
    PieChart,
    Users2,
    Briefcase
} from 'lucide-react';

export default function DashboardOverview() {
    const stats = [
        { label: 'Total Patients', value: '12,480', icon: Users, color: '#0ea5e9', trend: '+12%' },
        { label: 'Active Doctors', value: '450', icon: Stethoscope, color: '#10b981', trend: '+5%' },
        { label: 'Total Centers', value: '98', icon: Building, color: '#f59e0b', trend: '0%' },
        { label: 'Appointments', value: '1,240', icon: Calendar, color: '#ef4444', trend: '+18%' },
    ];

    const vaccineTypes = [
        { name: 'Covaxin', stock: 4500, consumed: 8500, color: '#0ea5e9' },
        { name: 'Covishield', stock: 2100, consumed: 12000, color: '#10b981' },
        { name: 'Pfizer', stock: 1200, consumed: 3400, color: '#8b5cf6' },
    ];

    const patientCategories = [
        { label: 'Senior Citizens (60+)', count: '4,200', percentage: 34, color: '#f59e0b' },
        { label: 'Adults (18-59)', count: '6,800', percentage: 54, color: '#0ea5e9' },
        { label: 'Children (5-17)', count: '1,480', percentage: 12, color: '#10b981' },
    ];

    const doseProgress = [
        { label: 'Dose 1 (Initial)', value: 85, color: '#10b981' },
        { label: 'Dose 2 (Complete)', value: 72, color: '#0ea5e9' },
        { label: 'Dose 3 (Booster)', value: 30, color: '#8b5cf6' },
        { label: 'Dose 4 (Precaution)', value: 12, color: '#f59e0b' },
    ];

    const availableDoctors = [
        { id: 1, name: 'Dr. Sarah Wilson', specialization: 'Immunologist', status: 'Available', color: '#10b981' },
        { id: 2, name: 'Dr. James Chen', specialization: 'Pediatrician', status: 'In Session', color: '#f59e0b' },
        { id: 3, name: 'Dr. Elena Rossi', specialization: 'GP', status: 'Available', color: '#10b981' },
    ];

    return (
        <div className="dashboard-overview" style={{ padding: '0 24px', paddingBottom: '40px' }}>
            {/* Welcome Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                        e-Booking Vaccination and Certificate Issuing System
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                        Real-time monitoring of vaccination distribution and patient care.
                    </p>
                </div>
                <div style={{ background: 'var(--surface)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>SYSTEM ONLINE</span>
                </div>
            </div>

            {/* Main Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {stats.map((stat, index) => (
                    <div key={index} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ padding: '12px', borderRadius: '14px', background: `${stat.color}15`, color: stat.color }}>
                                <stat.icon size={22} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: stat.trend.startsWith('+') ? '#10b981' : '#6b7280', background: stat.trend.startsWith('+') ? '#10b98115' : '#6b728015', padding: '4px 8px', borderRadius: '20px' }}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                        <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{stat.value}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, fontWeight: '500' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Middle Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* Dose Administration Progress */}
                <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={20} color="#0ea5e9" /> Dose Administration Summary
                        </h3>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Updated 2m ago</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {doseProgress.map((dose, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{dose.label}</span>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: dose.color }}>{dose.value}%</span>
                                </div>
                                <div style={{ height: '10px', background: 'var(--background)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${dose.value}%`, height: '100%', background: dose.color, borderRadius: '10px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Breakdown */}
                <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '28px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users2 size={20} color="#8b5cf6" /> Patient Groups
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {patientCategories.map((cat, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, flexShrink: 0 }}>
                                    <span style={{ fontWeight: '800' }}>{cat.percentage}%</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{cat.label}</p>
                                        <span style={{ fontWeight: '700' }}>{cat.count}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '4px', background: 'var(--background)', borderRadius: '4px', marginTop: '6px' }}>
                                        <div style={{ width: `${cat.percentage}%`, height: '100%', background: cat.color, borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Vaccine Inventory */}
                <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '28px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Vaccine Inventory
                        </h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Type</th>
                                <th style={{ padding: '12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Available</th>
                                <th style={{ padding: '12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Usage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vaccineTypes.map((v, i) => (
                                <tr key={i} style={{ borderBottom: i === vaccineTypes.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 0', fontSize: '14px', fontWeight: '600' }}>{v.name}</td>
                                    <td style={{ padding: '16px 0', fontSize: '14px', fontWeight: '700', color: '#10b981' }}>{v.stock.toLocaleString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'var(--background)', borderRadius: '6px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(v.consumed / (v.stock + v.consumed)) * 100}%`, height: '100%', background: v.color }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '30px' }}>high</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Available Doctors */}
                <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '28px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Briefcase size={20} color="#10b981" /> Duty Roster
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {availableDoctors.map((doc) => (
                            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--background)', borderRadius: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)' }}>
                                    <Stethoscope size={20} color="var(--primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{doc.name}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{doc.specialization}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: doc.color, padding: '4px 10px', background: 'var(--surface)', borderRadius: '20px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: doc.color }}></div>
                                    {doc.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Shortcuts (Refined) */}
                <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '28px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Administrative Tools</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            { icon: Calendar, label: 'Add Schedule', color: '#0ea5e9' },
                            { icon: Users, label: 'Add Patient', color: '#8b5cf6' },
                            { icon: Stethoscope, label: 'Assign Duty', color: '#10b981' },
                            { icon: CheckCircle, label: 'Reports', color: '#f59e0b' },
                        ].map((btn, i) => (
                            <button key={i} style={{
                                border: '1px solid var(--border)',
                                background: 'var(--surface)',
                                padding: '16px',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ color: btn.color }}>
                                    <btn.icon size={24} />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
