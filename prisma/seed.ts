import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ==========================================
  // Create Users
  // ==========================================
  
  const hashedPassword = await bcrypt.hash('password123', 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@basarnas.go.id',
        password: hashedPassword,
        name: 'Dr. Ahmad Kusworo',
        role: 'SUPER_ADMIN',
        unitKerja: 'Kantor Pusat',
        jabatan: 'Kepala Badan',
        nip: '196501011990031001',
      }
    }),
    prisma.user.create({
      data: {
        email: 'penyusun.pusat@basarnas.go.id',
        password: hashedPassword,
        name: 'Ir. Budi Santoso, M.T.',
        role: 'PENYUSUN_PUSAT',
        unitKerja: 'Kantor Pusat',
        jabatan: 'Kepala Biro Hukum dan Kerja Sama',
        nip: '197001151995031002',
      }
    }),
    prisma.user.create({
      data: {
        email: 'penyusun.jakarta@basarnas.go.id',
        password: hashedPassword,
        name: 'Drs. Eko Prasetyo, M.M.',
        role: 'PENYUSUN_WILAYAH',
        unitKerja: 'Kantor SAR Jakarta',
        jabatan: 'Kepala Kantor SAR',
        nip: '197502101998031003',
      }
    }),
    prisma.user.create({
      data: {
        email: 'penyusun.bali@basarnas.go.id',
        password: hashedPassword,
        name: 'I Wayan Sudarta, S.H., M.H.',
        role: 'PENYUSUN_WILAYAH',
        unitKerja: 'Kantor SAR Bali',
        jabatan: 'Kepala Kantor SAR',
        nip: '198003052000031004',
      }
    }),
    prisma.user.create({
      data: {
        email: 'reviewer@basarnas.go.id',
        password: hashedPassword,
        name: 'Dra. Sri Wahyuni, S.H., M.H.',
        role: 'REVIEWER_HUKUM',
        unitKerja: 'Kantor Pusat',
        jabatan: 'Analis Hukum Utama',
        nip: '197205201995032005',
      }
    }),
    prisma.user.create({
      data: {
        email: 'pimpinan@basarnas.go.id',
        password: hashedPassword,
        name: 'Dr. H. Muhammad Yusuf, M.Si.',
        role: 'PIMPINAN',
        unitKerja: 'Kantor Pusat',
        jabatan: 'Deputi Operasi Pencarian dan Pertolongan',
        nip: '196807151987031006',
      }
    }),
    prisma.user.create({
      data: {
        email: 'viewer@basarnas.go.id',
        password: hashedPassword,
        name: 'Anita Sari, S.E.',
        role: 'VIEWER',
        unitKerja: 'Kantor Pusat',
        jabatan: 'Staf Administrasi',
        nip: '199001012015032007',
      }
    }),
  ])

  console.log(`✅ Created ${users.length} users`)

  // ==========================================
  // Create Sample Regulation (Peraturan Basarnas No 2 Tahun 2025)
  // ==========================================

  const admin = users[0]
  
  const sampleRegulation = await prisma.regulation.create({
    data: {
      jenis: 'PERATURAN_BADAN',
      nomor: '2',
      tahun: 2025,
      tentang: 'Tata Cara Pembentukan Peraturan Perundang-undangan di Lingkungan Badan Nasional Pencarian dan Pertolongan',
      status: 'FINAL',
      unitKerja: 'Kantor Pusat',
      version: 1,
      finalizedAt: new Date('2025-01-07'),
      createdById: admin.id,
      header: {
        jenis: 'PERATURAN_BADAN',
        nomor: '2',
        tahun: 2025,
        tentang: 'Tata Cara Pembentukan Peraturan Perundang-undangan di Lingkungan Badan Nasional Pencarian dan Pertolongan'
      },
      konsiderans: {
        menimbang: [
          {
            id: '1',
            letter: 'a',
            text: 'bahwa untuk meningkatkan koordinasi, tertib administrasi, kelancaran, percepatan, dan penyeragaman dalam proses pembentukan peraturan perundang-undangan diperlukan metode yang pasti, baku, dan standar yang mengikat seluruh unit kerja di lingkungan Badan Nasional Pencarian dan Pertolongan;'
          },
          {
            id: '2',
            letter: 'b',
            text: 'bahwa Peraturan Kepala Badan Nasional Pencarian dan Pertolongan Nomor 9 Tahun 2017 tentang Tata Cara Pembentukan Peraturan Kepala Badan Nasional Pencarian dan Pertolongan masih belum menampung perkembangan dan kebutuhan hukum dalam pembentukan peraturan perundang-undangan di lingkungan Badan Nasional Pencarian dan Pertolongan, sehingga perlu diganti;'
          },
          {
            id: '3',
            letter: 'c',
            text: 'bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a dan huruf b, perlu menetapkan Peraturan Badan Nasional Pencarian dan Pertolongan tentang Tata Cara Pembentukan Peraturan Perundang-undangan di Lingkungan Badan Nasional Pencarian dan Pertolongan;'
          }
        ],
        mengingat: [
          {
            id: '1',
            number: 1,
            text: 'Undang-Undang Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan (Lembaran Negara Republik Indonesia Tahun 2011 Nomor 82, Tambahan Lembaran Negara Republik Indonesia Nomor 5234) sebagaimana telah beberapa kali diubah terakhir dengan Undang-Undang Nomor 13 Tahun 2022 tentang Perubahan Kedua atas Undang-Undang Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan (Lembaran Negara Republik Indonesia Tahun 2022 Nomor 143, Tambahan Lembaran Negara Republik Indonesia Nomor 6801);'
          },
          {
            id: '2',
            number: 2,
            text: 'Peraturan Presiden Nomor 87 Tahun 2014 tentang Peraturan Pelaksanaan Undang-Undang Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan (Lembaran Negara Republik Indonesia Tahun 2014 Nomor 199) sebagaimana telah diubah dengan Peraturan Presiden Nomor 76 Tahun 2021;'
          },
          {
            id: '3',
            number: 3,
            text: 'Peraturan Presiden Nomor 83 Tahun 2016 tentang Badan Nasional Pencarian dan Pertolongan (Lembaran Negara Republik Indonesia Tahun 2016 Nomor 186);'
          },
          {
            id: '4',
            number: 4,
            text: 'Peraturan Badan Nasional Pencarian dan Pertolongan Nomor 8 Tahun 2020 tentang Organisasi dan Tata Kerja Badan Nasional Pencarian dan Pertolongan;'
          }
        ],
        memperhatikan: []
      },
      diktum: {
        memutuskan: 'MEMUTUSKAN:',
        menetapkan: 'PERATURAN BADAN NASIONAL PENCARIAN DAN PERTOLONGAN TENTANG TATA CARA PEMBENTUKAN PERATURAN PERUNDANG-UNDANGAN DI LINGKUNGAN BADAN NASIONAL PENCARIAN DAN PERTOLONGAN.'
      },
      batangTubuh: [
        {
          id: 'bab1',
          type: 'BAB',
          number: 'I',
          title: 'KETENTUAN UMUM',
          children: [
            {
              id: 'pasal1',
              type: 'PASAL',
              number: 1,
              children: [
                {
                  id: 'ayat1-1',
                  type: 'AYAT',
                  number: 1,
                  text: 'Dalam Peraturan Badan ini yang dimaksud dengan:',
                  children: [
                    {
                      id: 'huruf1-1-1',
                      type: 'HURUF',
                      letter: 'a',
                      text: 'Pembentukan Peraturan Perundang-undangan adalah pembuatan Peraturan Perundang-undangan yang mencakup tahapan perencanaan, penyusunan, pembahasan, pengesahan atau penetapan, dan pengundangan.'
                    },
                    {
                      id: 'huruf1-1-2',
                      type: 'HURUF',
                      letter: 'b',
                      text: 'Peraturan Perundang-undangan adalah peraturan tertulis yang memuat norma hukum yang mengikat secara umum dan dibentuk atau ditetapkan oleh lembaga negara atau pejabat yang berwenang melalui prosedur yang ditetapkan dalam Peraturan Perundang-undangan.'
                    },
                    {
                      id: 'huruf1-1-3',
                      type: 'HURUF',
                      letter: 'c',
                      text: 'Program Penyusunan Peraturan di Lingkungan Badan Nasional Pencarian dan Pertolongan yang selanjutnya disebut Progsun Peraturan adalah instrumen perencanaan program pembentukan Peraturan Perundang-undangan di lingkungan Badan Nasional Pencarian dan Pertolongan yang disusun secara terencana, terpadu, dan sistematis.'
                    }
                  ]
                }
              ]
            },
            {
              id: 'pasal2',
              type: 'PASAL',
              number: 2,
              children: [
                {
                  id: 'ayat2-1',
                  type: 'AYAT',
                  number: 1,
                  text: 'Jenis Peraturan Perundang-undangan di lingkungan Badan meliputi:',
                  children: [
                    {
                      id: 'huruf2-1-a',
                      type: 'HURUF',
                      letter: 'a',
                      text: 'Undang-Undang/Peraturan Pemerintah Pengganti Undang-Undang;'
                    },
                    {
                      id: 'huruf2-1-b',
                      type: 'HURUF',
                      letter: 'b',
                      text: 'Peraturan Pemerintah;'
                    },
                    {
                      id: 'huruf2-1-c',
                      type: 'HURUF',
                      letter: 'c',
                      text: 'Peraturan Presiden; dan'
                    },
                    {
                      id: 'huruf2-1-d',
                      type: 'HURUF',
                      letter: 'd',
                      text: 'Peraturan Badan.'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'bab2',
          type: 'BAB',
          number: 'II',
          title: 'PERENCANAAN',
          children: [
            {
              id: 'pasal5',
              type: 'PASAL',
              number: 5,
              children: [
                {
                  id: 'ayat5-1',
                  type: 'AYAT',
                  number: 1,
                  text: 'Perencanaan penyusunan Undang-Undang dilaksanakan dalam program legislasi nasional.'
                },
                {
                  id: 'ayat5-2',
                  type: 'AYAT',
                  number: 2,
                  text: 'Perencanaan penyusunan Peraturan Pemerintah dan Peraturan Presiden dilakukan dalam suatu program penyusunan Peraturan Pemerintah dan program penyusunan Peraturan Presiden.'
                }
              ]
            }
          ]
        },
        {
          id: 'bab8',
          type: 'BAB',
          number: 'VIII',
          title: 'KETENTUAN PENUTUP',
          children: [
            {
              id: 'pasal35',
              type: 'PASAL',
              number: 35,
              children: [
                {
                  id: 'ayat35-1',
                  type: 'AYAT',
                  number: 1,
                  text: 'Pada saat Peraturan Badan ini mulai berlaku, Peraturan Kepala Badan Nasional Pencarian dan Pertolongan Nomor 9 Tahun 2017 tentang Tata Cara Pembentukan Peraturan Kepala Badan Nasional Pencarian dan Pertolongan (Berita Negara Republik Indonesia Tahun 2017 Nomor 880), dicabut dan dinyatakan tidak berlaku.'
                }
              ]
            },
            {
              id: 'pasal36',
              type: 'PASAL',
              number: 36,
              children: [
                {
                  id: 'ayat36-1',
                  type: 'AYAT',
                  number: 1,
                  text: 'Peraturan Badan ini mulai berlaku pada tanggal diundangkan.'
                }
              ]
            }
          ]
        }
      ],
      penutup: {
        tempat: 'Jakarta',
        tanggal: '2025-01-07',
        namaPejabat: 'KUSWORO',
        jabatan: 'KEPALA BADAN NASIONAL PENCARIAN DAN PERTOLONGAN REPUBLIK INDONESIA'
      },
      lampiran: null
    }
  })

  // Create search index for the sample regulation
  const searchContent = `${sampleRegulation.tentang} ${JSON.stringify(sampleRegulation.batangTubuh)}`
  await prisma.searchIndex.create({
    data: {
      regulationId: sampleRegulation.id,
      content: searchContent.toLowerCase()
    }
  })

  console.log('✅ Created sample regulation (Peraturan Basarnas No 2 Tahun 2025)')

  // ==========================================
  // Create Additional Draft Regulations
  // ==========================================

  const penyusunPusat = users[1]
  const penyusunJakarta = users[2]
  const penyusunBali = users[3]

  // Draft from Jakarta
  const draftJakarta = await prisma.regulation.create({
    data: {
      jenis: 'PEDOMAN',
      tahun: 2025,
      tentang: 'Pedoman Operasi Pencarian dan Pertolongan di Wilayah Perairan',
      status: 'DRAFT_WILAYAH',
      unitKerja: 'Kantor SAR Jakarta',
      version: 1,
      createdById: penyusunJakarta.id,
      header: {
        jenis: 'PEDOMAN',
        tahun: 2025,
        tentang: 'Pedoman Operasi Pencarian dan Pertolongan di Wilayah Perairan'
      },
      konsiderans: {
        menimbang: [
          {
            id: '1',
            letter: 'a',
            text: 'bahwa untuk meningkatkan efektivitas operasi pencarian dan pertolongan di wilayah perairan diperlukan pedoman yang jelas dan terstandar;'
          },
          {
            id: '2',
            letter: 'b',
            text: 'bahwa pedoman ini disusun sebagai acuan bagi seluruh personel dalam melaksanakan tugas pencarian dan pertolongan di perairan;'
          }
        ],
        mengingat: [
          {
            id: '1',
            number: 1,
            text: 'Peraturan Presiden Nomor 83 Tahun 2016 tentang Badan Nasional Pencarian dan Pertolongan;'
          }
        ],
        memperhatikan: []
      },
      diktum: {
        memutuskan: 'MEMUTUSKAN:',
        menetapkan: 'MENTETAPKAN PEDOMAN OPERASI PENCARIAN DAN PERTOLONGAN DI WILAYAH PERAIRAN.'
      },
      batangTubuh: [
        {
          id: 'bab1',
          type: 'BAB',
          number: 'I',
          title: 'KETENTUAN UMUM',
          children: [
            {
              id: 'pasal1',
              type: 'PASAL',
              number: 1,
              children: [
                {
                  id: 'ayat1-1',
                  type: 'AYAT',
                  number: 1,
                  text: 'Pedoman ini mengatur tata cara pelaksanaan operasi pencarian dan pertolongan di wilayah perairan.'
                }
              ]
            }
          ]
        }
      ],
      penutup: {
        tempat: 'Jakarta',
        tanggal: '',
        namaPejabat: '',
        jabatan: 'KEPALA KANTOR SAR JAKARTA'
      },
      lampiran: null
    }
  })

  await prisma.searchIndex.create({
    data: {
      regulationId: draftJakarta.id,
      content: `${draftJakarta.tentang} operasi pencarian pertolongan perairan`.toLowerCase()
    }
  })

  // Draft in review from Bali
  const draftBali = await prisma.regulation.create({
    data: {
      jenis: 'KEPUTUSAN',
      tahun: 2025,
      tentang: 'Keputusan tentang Pembentukan Tim Tanggap Darurat SAR Regional Bali',
      status: 'REVIEW_SUBSTANSI',
      unitKerja: 'Kantor SAR Bali',
      version: 1,
      createdById: penyusunBali.id,
      header: {
        jenis: 'KEPUTUSAN',
        tahun: 2025,
        tentang: 'Keputusan tentang Pembentukan Tim Tanggap Darurat SAR Regional Bali'
      },
      konsiderans: {
        menimbang: [
          {
            id: '1',
            letter: 'a',
            text: 'bahwa untuk meningkatkan kesiapsiagaan dalam menghadapi keadaan darurat diperlukan pembentukan tim tanggap darurat;'
          }
        ],
        mengingat: [],
        memperhatikan: []
      },
      diktum: {
        memutuskan: 'MEMUTUSKAN:',
        menetapkan: 'MENTETAPKAN KEPUTUSAN TENTANG PEMBENTUKAN TIM TANGGAP DARURAT SAR REGIONAL BALI.'
      },
      batangTubuh: [],
      penutup: {
        tempat: 'Denpasar',
        tanggal: '',
        namaPejabat: '',
        jabatan: 'KEPALA KANTOR SAR BALI'
      },
      lampiran: null
    }
  })

  await prisma.searchIndex.create({
    data: {
      regulationId: draftBali.id,
      content: `${draftBali.tentang} tim tanggap darurat bali`.toLowerCase()
    }
  })

  // Pending approval draft
  const pendingDraft = await prisma.regulation.create({
    data: {
      jenis: 'PERATURAN_BADAN',
      tahun: 2025,
      tentang: 'Peraturan tentang Standar Keselamatan Peralatan SAR',
      status: 'MENUNGGU_PERSETUJUAN',
      unitKerja: 'Kantor Pusat',
      version: 2,
      createdById: penyusunPusat.id,
      header: {
        jenis: 'PERATURAN_BADAN',
        tahun: 2025,
        tentang: 'Peraturan tentang Standar Keselamatan Peralatan SAR'
      },
      konsiderans: {
        menimbang: [
          {
            id: '1',
            letter: 'a',
            text: 'bahwa untuk menjamin keselamatan personel dan korban dalam operasi SAR, diperlukan standar keselamatan peralatan yang memadai;'
          },
          {
            id: '2',
            letter: 'b',
            text: 'bahwa standar keselamatan peralatan SAR perlu ditetapkan dalam suatu peraturan yang mengikat;'
          }
        ],
        mengingat: [
          {
            id: '1',
            number: 1,
            text: 'Peraturan Presiden Nomor 83 Tahun 2016 tentang Badan Nasional Pencarian dan Pertolongan;'
          },
          {
            id: '2',
            number: 2,
            text: 'Peraturan Badan Nomor 2 Tahun 2025 tentang Tata Cara Pembentukan Peraturan Perundang-undangan;'
          }
        ],
        memperhatikan: []
      },
      diktum: {
        memutuskan: 'MEMUTUSKAN:',
        menetapkan: 'PERATURAN BADAN NASIONAL PENCARIAN DAN PERTOLONGAN TENTANG STANDAR KESELAMATAN PERALATAN SAR.'
      },
      batangTubuh: [
        {
          id: 'bab1',
          type: 'BAB',
          number: 'I',
          title: 'KETENTUAN UMUM',
          children: [
            {
              id: 'pasal1',
              type: 'PASAL',
              number: 1,
              children: [
                {
                  id: 'ayat1-1',
                  type: 'AYAT',
                  number: 1,
                  text: 'Dalam Peraturan Badan ini yang dimaksud dengan Peralatan SAR adalah segala bentuk alat, mesin, atau perangkat yang digunakan dalam operasi pencarian dan pertolongan.'
                }
              ]
            }
          ]
        }
      ],
      penutup: {
        tempat: 'Jakarta',
        tanggal: '',
        namaPejabat: '',
        jabatan: 'KEPALA BADAN NASIONAL PENCARIAN DAN PERTOLONGAN REPUBLIK INDONESIA'
      },
      lampiran: null
    }
  })

  await prisma.searchIndex.create({
    data: {
      regulationId: pendingDraft.id,
      content: `${pendingDraft.tentang} standar keselamatan peralatan`.toLowerCase()
    }
  })

  console.log('✅ Created 3 additional draft regulations')

  // ==========================================
  // Create Audit Logs
  // ==========================================

  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'CREATE_REGULATION',
        entityType: 'Regulation',
        entityId: sampleRegulation.id,
        details: { message: 'Created Peraturan Basarnas No 2 Tahun 2025' },
        regulationId: sampleRegulation.id
      },
      {
        userId: admin.id,
        action: 'FINALIZE_REGULATION',
        entityType: 'Regulation',
        entityId: sampleRegulation.id,
        details: { message: 'Finalized Peraturan Basarnas No 2 Tahun 2025' },
        regulationId: sampleRegulation.id
      },
      {
        userId: penyusunJakarta.id,
        action: 'CREATE_REGULATION',
        entityType: 'Regulation',
        entityId: draftJakarta.id,
        details: { message: 'Created draft Pedoman Operasi Perairan' },
        regulationId: draftJakarta.id
      },
      {
        userId: penyusunBali.id,
        action: 'CREATE_REGULATION',
        entityType: 'Regulation',
        entityId: draftBali.id,
        details: { message: 'Created draft Keputusan Tim Tanggap Darurat' },
        regulationId: draftBali.id
      },
      {
        userId: penyusunBali.id,
        action: 'SUBMIT_FOR_REVIEW',
        entityType: 'Regulation',
        entityId: draftBali.id,
        details: { message: 'Submitted for substansi review' },
        regulationId: draftBali.id
      },
      {
        userId: penyusunPusat.id,
        action: 'CREATE_REGULATION',
        entityType: 'Regulation',
        entityId: pendingDraft.id,
        details: { message: 'Created draft Peraturan Standar Keselamatan' },
        regulationId: pendingDraft.id
      },
    ]
  })

  console.log('✅ Created audit logs')

  // ==========================================
  // Create Relation
  // ==========================================

  // The sample regulation revokes the old regulation (No 9 Tahun 2017)
  await prisma.regulationRelation.create({
    data: {
      sourceId: sampleRegulation.id,
      targetId: sampleRegulation.id, // Self-reference for demo
      relationType: 'MENCABUT',
      description: 'Mencabut dan menyatakan tidak berlaku Peraturan Kepala Basarnas Nomor 9 Tahun 2017'
    }
  })

  console.log('✅ Created regulation relations')

  // ==========================================
  // Create System Settings
  // ==========================================

  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'system_name',
        value: 'SISNAS PERATURAN BASARNAS',
        description: 'Nama sistem'
      },
      {
        key: 'system_version',
        value: '1.0.0',
        description: 'Versi sistem'
      },
      {
        key: 'organization_name',
        value: 'Badan Nasional Pencarian dan Pertolongan',
        description: 'Nama organisasi'
      },
      {
        key: 'max_file_size_mb',
        value: '10',
        description: 'Ukuran maksimum file upload dalam MB'
      }
    ]
  })

  console.log('✅ Created system settings')

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Login credentials (password: password123):')
  console.log('   - admin@basarnas.go.id (Super Admin)')
  console.log('   - penyusun.pusat@basarnas.go.id (Penyusun Pusat)')
  console.log('   - penyusun.jakarta@basarnas.go.id (Penyusun Wilayah Jakarta)')
  console.log('   - penyusun.bali@basarnas.go.id (Penyusun Wilayah Bali)')
  console.log('   - reviewer@basarnas.go.id (Reviewer Hukum)')
  console.log('   - pimpinan@basarnas.go.id (Pimpinan)')
  console.log('   - viewer@basarnas.go.id (Viewer)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
