const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')

const prisma = new PrismaClient()

async function loadCSVFile(filename) {
    // Try different potential paths
    const potentialPaths = [
        path.join(__dirname, `../../data/${filename}`),     // /data folder in project root
        path.join(__dirname, `data/${filename}`),        // /prisma/data folder
        path.join(__dirname, `../uploads/${filename}`),  // /uploads folder
        path.join(__dirname, filename)                   // current directory
    ]

    let csvData
    for (const filepath of potentialPaths) {
        if (fs.existsSync(filepath)) {
            console.log(`Found ${filename} at: ${filepath}`)
            const fileContent = fs.readFileSync(filepath, 'utf-8')
            csvData = Papa.parse(fileContent, {
                header: false,
                skipEmptyLines: true,
                dynamicTyping: true
            }).data
            break
        }
    }

    if (!csvData) {
        throw new Error(`Could not find ${filename} in any of the expected locations. Please place the file in one of: /data, /prisma/data, /uploads, or ${__dirname}`)
    }

    return csvData
}

async function main() {
    try {
        // Get root password from environment or use provided hash
        const rootPasswordHash = process.env.ROOT_PASSWORD_HASH

        if (!rootPasswordHash) {
            throw new Error('ROOT_PASSWORD_HASH must be set in environment variables')
        }

        console.log('Starting seed...')

        // First create the 4 regions
        const regions = [
            { code: 1, name: 'Southern' },
            { code: 2, name: 'Highlands' },
            { code: 3, name: 'Momase' },
            { code: 4, name: 'New Guinea Islands' }
        ]

        console.log('Seeding regions...')
        for (const region of regions) {
            await prisma.region.upsert({
                where: { code: region.code },
                update: {},
                create: region
            })
        }

        // Load provinces
        console.log('Loading provinces data...')
        const provincesData = await loadCSVFile('pngProvinces.csv')

        // Map provinces to regions
        const provinceRegionMap = {
            1: 1, 2: 1, 3: 1, // Southern
            4: 2, 5: 2, 6: 2, 7: 2, // Highlands
            8: 3, 9: 3, 10: 3, 11: 3, // Momase
            12: 4, 13: 4, 14: 4, 15: 4 // New Guinea Islands
        }

        console.log('Seeding provinces...')
        for (const province of provincesData) {
            const regionCode = provinceRegionMap[province[0]] // First column is the province code
            const region = await prisma.region.findUnique({
                where: { code: regionCode }
            })

            if (!region) continue

            await prisma.province.upsert({
                where: {
                    code_regionId: {
                        code: province[0],
                        regionId: region.id
                    }
                },
                update: {},
                create: {
                    code: province[0],
                    name: province[1], // Second column is the province name
                    regionId: region.id
                }
            })
        }

        // Load districts
        console.log('Loading districts data...')
        const districtsData = await loadCSVFile('pngDistricts.csv')

        console.log('Seeding districts...')
        for (const district of districtsData) {
            const province = await prisma.province.findFirst({
                where: { code: district[1] } // Second column is province code
            })

            if (!province) continue

            await prisma.district.upsert({
                where: {
                    code_provinceId: {
                        code: district[0], // First column is district code
                        provinceId: province.id
                    }
                },
                update: {},
                create: {
                    code: district[0],
                    name: district[2], // Third column is district name
                    provinceId: province.id
                }
            })
        }

        // Load LLGs
        console.log('Loading LLGs data...')
        const llgsData = await loadCSVFile('pngLLGs.csv')

        console.log('Seeding LLGs...')
        for (const llg of llgsData) {
            const district = await prisma.district.findFirst({
                where: { code: llg[1] } // Second column is district code
            })

            if (!district) continue

            await prisma.lLG.upsert({
                where: {
                    code_districtId: {
                        code: llg[0], // First column is LLG code
                        districtId: district.id
                    }
                },
                update: {},
                create: {
                    code: llg[0],
                    name: llg[2], // Third column is LLG name
                    districtId: district.id
                }
            })
        }

        // Load Wards
        console.log('Loading wards data...')
        const wardsData = await loadCSVFile('pngWards.csv')

        console.log('Seeding wards...')
        for (const ward of wardsData) {
            const llg = await prisma.lLG.findFirst({
                where: { code: ward[1] } // Second column is LLG code
            })

            if (!llg) continue

            await prisma.ward.upsert({
                where: {
                    code_llgId: {
                        code: ward[0], // First column is ward code
                        llgId: llg.id
                    }
                },
                update: {},
                create: {
                    code: ward[0],
                    name: ward[2], // Third column is ward name
                    llgId: llg.id
                }
            })
        }

        // Load Locations
        console.log('Loading locations data...')
        const locationsData = await loadCSVFile('pngLocations.csv')

        console.log('Seeding locations...')
        for (const location of locationsData) {
            const ward = await prisma.ward.findFirst({
                where: { code: location[1] } // Second column is ward code
            })

            if (!ward) continue

            await prisma.location.upsert({
                where: {
                    code_wardId: {
                        code: location[0], // First column is location code
                        wardId: ward.id
                    }
                },
                update: {},
                create: {
                    code: location[0],
                    name: location[2], // Third column is location name
                    wardId: ward.id
                }
            })
        }

        // Create root user
        console.log('Creating root user...')
        await prisma.user.upsert({
            where: { email: 'root@admin.com' },
            update: {},
            create: {
                email: 'root@admin.com',
                name: 'Root Admin',
                password: rootPasswordHash,
                role: 'ROOT'
            }
        })

        console.log('Seed completed successfully')
    } catch (error) {
        console.error('Error seeding database:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })