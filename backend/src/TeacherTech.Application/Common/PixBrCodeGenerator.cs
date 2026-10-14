using System.Globalization;
using System.Text;

namespace TeacherTech.Application.Common;

/// <summary>
/// Gerador de payload Pix padrão BR Code (EMV QR Code) definido pelo Banco Central do Brasil (BACEN).
/// Gera códigos Pix Copia-e-Cola estáticos ou dinâmicos P2P sem dependência de APIs bancárias de terceiros.
/// </summary>
public static class PixBrCodeGenerator
{
    private const string PayloadFormatIndicator = "000201";
    private const string GuiPix = "br.gov.bcb.pix";
    private const string MerchantCategoryCode = "0000";
    private const string CurrencyBrl = "986"; // ISO 4217 para Real Brasileiro
    private const string CountryCodeBr = "BR";
    private const string DefaultCity = "BRASILIA";
    private const string DefaultTxId = "***";

    /// <summary>
    /// Gera a string completa do BR Code Pix (Pix Copia-e-Cola) com CRC16-CCITT válido.
    /// </summary>
    /// <param name="pixKey">Chave Pix do recebedor (CPF, CNPJ, E-mail, Telefone ou Chave Aleatória).</param>
    /// <param name="merchantName">Nome do recebedor (máximo 25 caracteres, sem acentos).</param>
    /// <param name="merchantCity">Cidade do recebedor (máximo 15 caracteres, sem acentos).</param>
    /// <param name="amount">Valor da cobrança em Reais (opcional).</param>
    /// <param name="txId">Identificador da transação (TxId, máximo 25 caracteres alfanuméricos).</param>
    /// <returns>String formatada pronta para uso em QR Code ou Copia-e-Cola.</returns>
    public static string GeneratePayload(
        string pixKey,
        string merchantName,
        string? merchantCity = null,
        decimal? amount = null,
        string? txId = null)
    {
        if (string.IsNullOrWhiteSpace(pixKey))
            throw new ArgumentException("A Chave Pix é obrigatória para gerar o BR Code.", nameof(pixKey));

        var cleanPixKey = pixKey.Trim();
        var normalizedName = NormalizeAscii(string.IsNullOrWhiteSpace(merchantName) ? "PROFESSOR" : merchantName, 25);
        var normalizedCity = NormalizeAscii(string.IsNullOrWhiteSpace(merchantCity) ? DefaultCity : merchantCity, 15);
        var normalizedTxId = NormalizeTxId(txId);

        var sb = new StringBuilder();

        // 00 - Payload Format Indicator
        sb.Append(PayloadFormatIndicator);

        // 26 - Merchant Account Information (Pix GUI + Chave)
        var merchantAccountInfo = FormatTlv("00", GuiPix) + FormatTlv("01", cleanPixKey);
        sb.Append(FormatTlv("26", merchantAccountInfo));

        // 52 - Merchant Category Code
        sb.Append(FormatTlv("52", MerchantCategoryCode));

        // 53 - Transaction Currency (986 = BRL)
        sb.Append(FormatTlv("53", CurrencyBrl));

        // 54 - Transaction Amount (se informado e maior que zero)
        if (amount.HasValue && amount.Value > 0)
        {
            var formattedAmount = amount.Value.ToString("0.00", CultureInfo.InvariantCulture);
            sb.Append(FormatTlv("54", formattedAmount));
        }

        // 58 - Country Code (BR)
        sb.Append(FormatTlv("58", CountryCodeBr));

        // 59 - Merchant Name
        sb.Append(FormatTlv("59", normalizedName));

        // 60 - Merchant City
        sb.Append(FormatTlv("60", normalizedCity));

        // 62 - Additional Data Field (TxId / Referência)
        var additionalDataField = FormatTlv("05", normalizedTxId);
        sb.Append(FormatTlv("62", additionalDataField));

        // 63 - CRC16 (Tag "63" com tamanho 4 "04" seguido do cálculo)
        var payloadWithoutCrc = sb.ToString() + "6304";
        var crc = CalculateCrc16(payloadWithoutCrc);

        return payloadWithoutCrc + crc.ToString("X4", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Formata um campo no padrão TLV (Tag-Length-Value): ID (2 dígitos) + Tamanho (2 dígitos) + Valor.
    /// </summary>
    private static string FormatTlv(string id, string value)
    {
        return $"{id}{value.Length:D2}{value}";
    }

    /// <summary>
    /// Calcula o CRC16-CCITT (Polinômio 0x1021, valor inicial 0xFFFF, sem reversão) conforme especificação do BACEN.
    /// </summary>
    public static ushort CalculateCrc16(string data)
    {
        ushort crc = 0xFFFF;
        var bytes = Encoding.UTF8.GetBytes(data);

        foreach (var b in bytes)
        {
            crc ^= (ushort)(b << 8);
            for (var i = 0; i < 8; i++)
            {
                if ((crc & 0x8000) != 0)
                {
                    crc = (ushort)((crc << 1) ^ 0x1021);
                }
                else
                {
                    crc = (ushort)(crc << 1);
                }
            }
        }

        return crc;
    }

    /// <summary>
    /// Remove acentos e caracteres especiais conforme exigido pelo BACEN (somente ASCII A-Z, 0-9 e espaço).
    /// </summary>
    private static string NormalizeAscii(string text, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var uc = CharUnicodeInfo.GetUnicodeCategory(c);
            if (uc != UnicodeCategory.NonSpacingMark)
            {
                if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == ' ')
                {
                    sb.Append(c);
                }
            }
        }

        var result = sb.ToString().Trim().ToUpperInvariant();
        if (result.Length > maxLength)
        {
            result = result[..maxLength];
        }

        return string.IsNullOrWhiteSpace(result) ? "PROFESSOR" : result;
    }

    /// <summary>
    /// Normaliza o TxId para no máximo 25 caracteres alfanuméricos válidos.
    /// Se vazio, utiliza "***" padrão BACEN para cobrança sem txid estrito.
    /// </summary>
    private static string NormalizeTxId(string? txId)
    {
        if (string.IsNullOrWhiteSpace(txId)) return DefaultTxId;

        var sb = new StringBuilder();
        foreach (var c in txId)
        {
            if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9'))
            {
                sb.Append(c);
            }
        }

        var result = sb.ToString();
        if (result.Length == 0) return DefaultTxId;
        if (result.Length > 25) result = result[..25];

        return result;
    }
}
