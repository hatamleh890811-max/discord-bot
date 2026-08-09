const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// ذاكرة مؤقتة لحفظ وقت الدخول
const attendanceMap = new Map();

client.once('ready', () => {
    console.log(`✅ البوت يعمل الآن باسم: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.content === '!panel') {
        // رابط الصورة الجديدة التي أرسلتها
        const communityImageUrl = 'https://i.imgur.com/TjY7R1O.jpeg';

        const embed = new EmbedBuilder()
            .setTitle('🌟 نظام الحضور والانصراف - 𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲')
            .setDescription('أهلاً بك في سيرفر **𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲**!\nيرجى استخدام الأزرار أدناه لتسجيل الدخول أو الخروج من وقت العمل.\n\n⚠️ **شروط التسجيل:**\n• يجب أن تكون بحالة **Online** لتتمكن من تسجيل الدخول.')
            .setColor(0x0099FF) // لون أزرق ليتناسب مع الصورة
            .setThumbnail(message.guild.iconURL({ dynamic: true })) // شعار السيرفر كصورة مصغرة
            .setImage(communityImageUrl) // <-- وضعنا الصورة الزرقاء هنا كصورة رئيسية كبيرة
            .setFooter({ text: '𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲 Attendance System', iconURL: message.client.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('login_btn')
                .setLabel('تسجيل دخول')
                .setEmoji('📥')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('logout_btn')
                .setLabel('تسجيل خروج')
                .setEmoji('📤')
                .setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const member = interaction.member;
    const status = member.presence?.status;

    // 1. تسجيل الدخول
    if (interaction.customId === 'login_btn') {
        if (!status || status === 'offline') {
            return await interaction.reply({ 
                content: '❌ **عذراً!** لا يمكنك تسجيل الدخول وأنت في وضع **Offline** أو غير مرئي.', 
                ephemeral: true 
            });
        }

        if (attendanceMap.has(member.id)) {
            return await interaction.reply({ 
                content: '⚠️ أنت مسجل دخول بالفعل ولم تقم بتسجيل الخروج بعد!', 
                ephemeral: true 
            });
        }

        attendanceMap.set(member.id, Date.now());
        await interaction.reply({ 
            content: '✅ **تم تسجيل دخولك بنجاح!** بالتوفيق في عملك داخل سيرفر 𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲.', 
            ephemeral: true 
        });
    }

    // 2. تسجيل الخروج وحساب الوقت
    if (interaction.customId === 'logout_btn') {
        if (!attendanceMap.has(member.id)) {
            return await interaction.reply({ 
                content: '❌ لم تقم بتسجيل الدخول أساساً لتسجيل الخروج!', 
                ephemeral: true 
            });
        }

        const loginTime = attendanceMap.get(member.id);
        const logoutTime = Date.now();
        const diff = logoutTime - loginTime;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        attendanceMap.delete(member.id);

        const embed = new EmbedBuilder()
            .setTitle('📊 تقرير فترة العمل - 𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲')
            .setColor(0x0099FF)
            .addFields(
                { name: '👤 الموظف / الإداري', value: `${member}`, inline: true },
                { name: '⏱️ إجمالي مدة العمل', value: `**${hours}** ساعة و **${minutes}** دقيقة`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
});

// تم إضافة التوكن الخاص بك هنا
client.login('MTUyMzQ0NDU4MDA0Mzg1MzgyNA.Gf1Uhg.h_AC9XfjRufwGeO2tRYqo3hsqCRc7SjNmm81Io');